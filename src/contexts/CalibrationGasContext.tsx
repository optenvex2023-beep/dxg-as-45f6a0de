import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  CalibrationGasInventoryItem,
  CalibrationGasUploadFile,
  CalibrationGasExtraction,
  CalibrationGasExtractionItem,
  CalibrationGasHistory,
  CalibrationGasNotification,
  CalGasNotificationType,
} from "@/types/calibrationGas";
import { seedCalibrationGasInventory, siteAliases } from "@/data/calibrationGasData";

interface CalGasState {
  inventory: CalibrationGasInventoryItem[];
  uploads: CalibrationGasUploadFile[];
  extractions: CalibrationGasExtraction[];
  history: CalibrationGasHistory[];
  notifications: CalibrationGasNotification[];

  /* Inventory */
  updateInventoryItem: (id: string, updates: Partial<CalibrationGasInventoryItem>) => void;

  /* Upload flow */
  addUploadFile: (file: CalibrationGasUploadFile) => void;
  addExtraction: (extraction: CalibrationGasExtraction) => void;
  updateExtractionField: (extractionId: string, field: string, value: string) => void;
  updateExtractionItem: (extractionId: string, itemIdx: number, updates: Partial<CalibrationGasExtractionItem>) => void;
  setExtractionMatchedIds: (extractionId: string, ids: string[]) => void;
  approveExtraction: (extractionId: string, userName: string) => void;
  rejectExtraction: (extractionId: string) => void;

  /* Notifications */
  markCalGasNotificationRead: (id: string) => void;
  markAllCalGasNotificationsRead: () => void;

  /* Helpers */
  normalizeSiteName: (raw: string) => string;
  findMatchingInventory: (site: string, unit: string, gasName: string) => CalibrationGasInventoryItem[];
}

const CalGasContext = createContext<CalGasState | null>(null);

export function useCalGas() {
  const ctx = useContext(CalGasContext);
  if (!ctx) throw new Error("useCalGas must be inside CalGasProvider");
  return ctx;
}

export function CalGasProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<CalibrationGasInventoryItem[]>(seedCalibrationGasInventory);
  const [uploads, setUploads] = useState<CalibrationGasUploadFile[]>([]);
  const [extractions, setExtractions] = useState<CalibrationGasExtraction[]>([]);
  const [history, setHistory] = useState<CalibrationGasHistory[]>([]);
  const [notifications, setNotifications] = useState<CalibrationGasNotification[]>([]);

  const normalizeSiteName = useCallback((raw: string): string => {
    const trimmed = raw.trim();
    for (const alias of siteAliases) {
      if (alias.canonical === trimmed) return alias.canonical;
      for (const a of alias.aliases) {
        if (trimmed.includes(a) || a.includes(trimmed)) return alias.canonical;
      }
    }
    // Check if inventory has exact match
    const found = seedCalibrationGasInventory.find(
      (i) => i.site_name === trimmed || trimmed.includes(i.site_name) || i.site_name.includes(trimmed)
    );
    return found ? found.site_name : trimmed;
  }, []);

  const findMatchingInventory = useCallback(
    (site: string, unit: string, gasName: string): CalibrationGasInventoryItem[] => {
      const normalizedSite = normalizeSiteName(site);
      return inventory.filter((item) => {
        const siteMatch = item.site_name === normalizedSite;
        const unitMatch =
          item.unit_no === unit ||
          item.unit_no.includes(unit) ||
          unit.includes(item.unit_no);
        const gasMatch =
          item.gas_name.toLowerCase().includes(gasName.toLowerCase()) ||
          gasName.toLowerCase().includes(item.gas_name.toLowerCase());
        return siteMatch && unitMatch && gasMatch;
      });
    },
    [inventory, normalizeSiteName]
  );

  const updateInventoryItem = useCallback(
    (id: string, updates: Partial<CalibrationGasInventoryItem>) => {
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const addUploadFile = useCallback((file: CalibrationGasUploadFile) => {
    setUploads((prev) => [...prev, file]);
  }, []);

  const addExtraction = useCallback((extraction: CalibrationGasExtraction) => {
    setExtractions((prev) => [...prev, extraction]);
    if (extraction.match_status === "match_failed") {
      pushNotification("match_failed", "매칭 실패", `${extraction.file_name}: 매칭되는 재고를 찾을 수 없습니다.`, `/calibration-gas/review`, extraction.id);
    } else if (extraction.match_status === "review_needed") {
      pushNotification("review_needed", "검토 필요", `${extraction.file_name}: 복수 매칭이 발견되어 검토가 필요합니다.`, `/calibration-gas/review`, extraction.id);
    }
  }, []);

  const updateExtractionField = useCallback((extractionId: string, field: string, value: string) => {
    setExtractions((prev) =>
      prev.map((e) =>
        e.id === extractionId ? { ...e, [field]: value } : e
      )
    );
  }, []);

  const updateExtractionItem = useCallback(
    (extractionId: string, itemIdx: number, updates: Partial<CalibrationGasExtractionItem>) => {
      setExtractions((prev) =>
        prev.map((e) => {
          if (e.id !== extractionId) return e;
          const items = [...e.items];
          items[itemIdx] = { ...items[itemIdx], ...updates };
          return { ...e, items };
        })
      );
    },
    []
  );

  const setExtractionMatchedIds = useCallback((extractionId: string, ids: string[]) => {
    setExtractions((prev) =>
      prev.map((e) =>
        e.id === extractionId
          ? { ...e, matched_inventory_ids: ids, match_status: ids.length > 0 ? "matched" : "match_failed" }
          : e
      )
    );
  }, []);

  const approveExtraction = useCallback(
    (extractionId: string, userName: string) => {
      const extraction = extractions.find((e) => e.id === extractionId);
      if (!extraction) return;

      const now = new Date().toISOString();
      const newHistory: CalibrationGasHistory[] = [];

      // Apply updates to matched inventory items
      for (const exItem of extraction.items) {
        // Find matching inventory items
        const matches = extraction.matched_inventory_ids.length > 0
          ? inventory.filter((inv) => extraction.matched_inventory_ids.includes(inv.id))
          : findMatchingInventory(extraction.detected_site, extraction.detected_unit, exItem.gas_name);

        const gasMatches = matches.filter(
          (inv) =>
            inv.gas_name.toLowerCase().includes(exItem.gas_name.toLowerCase()) ||
            exItem.gas_name.toLowerCase().includes(inv.gas_name.toLowerCase())
        );

        for (const match of gasMatches) {
          if (exItem.remaining_percent && exItem.remaining_percent !== match.remaining_percent) {
            newHistory.push({
              id: crypto.randomUUID(),
              inventory_item_id: match.id,
              file_name: extraction.file_name,
              field_name: "remaining_percent",
              before_value: match.remaining_percent,
              after_value: exItem.remaining_percent,
              updated_at: now,
              updated_by: userName,
            });
            updateInventoryItem(match.id, { remaining_percent: exItem.remaining_percent });
          }
          if (exItem.expiry_date && exItem.expiry_date !== match.expiry_date) {
            newHistory.push({
              id: crypto.randomUUID(),
              inventory_item_id: match.id,
              file_name: extraction.file_name,
              field_name: "expiry_date",
              before_value: match.expiry_date || "",
              after_value: exItem.expiry_date,
              updated_at: now,
              updated_by: userName,
            });
            updateInventoryItem(match.id, { expiry_date: exItem.expiry_date });
          }
        }
      }

      setHistory((prev) => [...prev, ...newHistory]);
      setExtractions((prev) =>
        prev.map((e) => (e.id === extractionId ? { ...e, status: "approved" } : e))
      );
      setUploads((prev) =>
        prev.map((u) => (u.id === extraction.upload_file_id ? { ...u, status: "applied" } : u))
      );
    },
    [extractions, inventory, findMatchingInventory, updateInventoryItem]
  );

  const rejectExtraction = useCallback((extractionId: string) => {
    setExtractions((prev) =>
      prev.map((e) => (e.id === extractionId ? { ...e, status: "rejected" } : e))
    );
  }, []);

  /* ── Notifications ── */
  const pushNotification = useCallback(
    (type: CalGasNotificationType, title: string, body: string, link_url: string | null, related_id: string | null) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          title,
          body,
          link_url,
          created_at: new Date().toISOString(),
          read_at: null,
          related_id,
        },
      ]);
    },
    []
  );

  const markCalGasNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  }, []);

  const markAllCalGasNotificationsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
  }, []);

  /* ── Check for expiry/low remaining on mount ── */
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    for (const item of inventory) {
      // Expiry soon check
      if (item.expiry_date) {
        const expDate = new Date(item.expiry_date);
        if (expDate <= sixtyDaysLater && expDate >= today) {
          const existing = notifications.find(
            (n) => n.type === "expiry_soon" && n.related_id === item.id
          );
          if (!existing) {
            pushNotification(
              "expiry_soon",
              "유효기간 임박",
              `${item.site_name} ${item.unit_no}호기 ${item.gas_name} 유효기간이 임박했습니다. (${item.expiry_date})`,
              `/calibration-gas/inventory`,
              item.id
            );
          }
        }
      }
      // Low remaining check (< 30%)
      const pct = parseInt(item.remaining_percent);
      if (!isNaN(pct) && pct < 30) {
        const existing = notifications.find(
          (n) => n.type === "low_remaining" && n.related_id === item.id
        );
        if (!existing) {
          pushNotification(
            "low_remaining",
            "잔량 부족",
            `${item.site_name} ${item.unit_no}호기 ${item.gas_name} 잔량이 ${item.remaining_percent}입니다.`,
            `/calibration-gas/inventory`,
            item.id
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CalGasContext.Provider
      value={{
        inventory,
        uploads,
        extractions,
        history,
        notifications,
        updateInventoryItem,
        addUploadFile,
        addExtraction,
        updateExtractionField,
        updateExtractionItem,
        setExtractionMatchedIds,
        approveExtraction,
        rejectExtraction,
        markCalGasNotificationRead,
        markAllCalGasNotificationsRead,
        normalizeSiteName,
        findMatchingInventory,
      }}
    >
      {children}
    </CalGasContext.Provider>
  );
}
