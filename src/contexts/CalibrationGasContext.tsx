import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
import { parseGasLabel, matchGasToInventory } from "@/lib/gasMatchingUtils";
import {
  fetchCalGasInventory, insertCalGasInventoryItems, insertCalGasInventoryItem as insertCalGasItemDb,
  updateCalGasInventoryItem as updateCalGasItemDb, deleteCalGasInventoryItem as deleteCalGasItemDb,
  fetchCalGasHistory, insertCalGasHistoryItems,
} from "@/lib/supabaseDb";

interface CalGasState {
  inventory: CalibrationGasInventoryItem[];
  uploads: CalibrationGasUploadFile[];
  extractions: CalibrationGasExtraction[];
  history: CalibrationGasHistory[];
  notifications: CalibrationGasNotification[];
  isLoading: boolean;

  /* Inventory */
  updateInventoryItem: (id: string, updates: Partial<CalibrationGasInventoryItem>) => void;
  addInventoryItem: (item: CalibrationGasInventoryItem) => void;
  deleteInventoryItem: (id: string) => void;

  /* History */
  addHistoryItems: (items: CalibrationGasHistory[]) => void;

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

  /* Refetch (additive) */
  refetchAll: () => Promise<void>;
}

const CalGasContext = createContext<CalGasState | null>(null);

export function useCalGas() {
  const ctx = useContext(CalGasContext);
  if (!ctx) throw new Error("useCalGas must be inside CalGasProvider");
  return ctx;
}

export function CalGasProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<CalibrationGasInventoryItem[]>([]);
  const [uploads, setUploads] = useState<CalibrationGasUploadFile[]>([]);
  const [extractions, setExtractions] = useState<CalibrationGasExtraction[]>([]);
  const [history, setHistory] = useState<CalibrationGasHistory[]>([]);
  const [notifications, setNotifications] = useState<CalibrationGasNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataLoadedRef = useRef(false);

  /* ─── Load data from Supabase on mount ─── */
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    async function loadData() {
      try {
        let dbInventory = await fetchCalGasInventory();
        if (dbInventory.length === 0) {
          console.log("No calibration gas inventory in DB, seeding...");
          await insertCalGasInventoryItems(seedCalibrationGasInventory);
          dbInventory = await fetchCalGasInventory();
        }
        setInventory(dbInventory);

        const dbHistory = await fetchCalGasHistory();
        setHistory(dbHistory);
      } catch (err) {
        console.error("Error loading cal gas data from Supabase:", err);
        setInventory(seedCalibrationGasInventory);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  /** Strip whitespace, punctuation, and common noise words for comparison */
  const stripForCompare = (s: string) =>
    s.replace(/[\s\-_()（）\[\]]/g, "").replace(/공장|사업장|대상/g, "").toLowerCase();

  /** Simple similarity score (shared character n-grams) */
  const similarity = (a: string, b: string): number => {
    const sa = stripForCompare(a);
    const sb = stripForCompare(b);
    if (!sa || !sb) return 0;
    if (sa === sb) return 1;
    if (sa.includes(sb) || sb.includes(sa)) return 0.85;
    const bigrams = (s: string) => {
      const set = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) set.add(s.substring(i, i + 2));
      return set;
    };
    const ba = bigrams(sa);
    const bb = bigrams(sb);
    let shared = 0;
    ba.forEach((b) => { if (bb.has(b)) shared++; });
    return (2 * shared) / (ba.size + bb.size);
  };

  const normalizeSiteName = useCallback((raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;

    for (const alias of siteAliases) {
      if (alias.canonical === trimmed) return alias.canonical;
    }
    for (const alias of siteAliases) {
      for (const a of alias.aliases) {
        if (trimmed.includes(a) || a.includes(trimmed)) return alias.canonical;
      }
    }
    const uniqueSites = [...new Set(inventory.map((i) => i.site_name))];
    const exactFound = uniqueSites.find(
      (s) => s === trimmed || stripForCompare(s) === stripForCompare(trimmed)
    );
    if (exactFound) return exactFound;

    const partialFound = uniqueSites.find(
      (s) => trimmed.includes(s) || s.includes(trimmed)
    );
    if (partialFound) return partialFound;

    let bestScore = 0;
    let bestSite = "";
    for (const s of uniqueSites) {
      const score = similarity(trimmed, s);
      if (score > bestScore) { bestScore = score; bestSite = s; }
    }
    for (const alias of siteAliases) {
      const score = similarity(trimmed, alias.canonical);
      if (score > bestScore) { bestScore = score; bestSite = alias.canonical; }
      for (const a of alias.aliases) {
        const sc = similarity(trimmed, a);
        if (sc > bestScore) { bestScore = sc; bestSite = alias.canonical; }
      }
    }
    if (bestScore >= 0.6 && bestSite) return bestSite;

    return trimmed;
  }, [inventory]);

  const findMatchingInventory = useCallback(
    (site: string, unit: string, gasName: string): CalibrationGasInventoryItem[] => {
      const normalizedSite = normalizeSiteName(site);

      let candidates = inventory.filter((item) => item.site_name === normalizedSite);
      if (candidates.length === 0) {
        candidates = inventory.filter((item) => {
          const score = similarity(site, item.site_name);
          return score >= 0.6 || item.site_name.includes(site) || site.includes(item.site_name);
        });
      }

      const unitCandidates = candidates.filter((item) => {
        return item.unit_no === unit || item.unit_no.includes(unit) || unit.includes(item.unit_no);
      });

      const parsed = parseGasLabel(gasName);
      if (parsed.gasSymbols.length > 0 && parsed.type !== "unknown") {
        const semanticMatches = matchGasToInventory(
          parsed,
          unitCandidates.map((c) => ({ id: c.id, gas_name: c.gas_name, concentration: c.concentration }))
        );
        if (semanticMatches.length > 0) {
          const matchedIds = new Set(semanticMatches.map((m) => m.inventoryId));
          return unitCandidates.filter((item) => matchedIds.has(item.id));
        }
      }

      return unitCandidates.filter((item) => {
        return item.gas_name.toLowerCase().includes(gasName.toLowerCase()) ||
          gasName.toLowerCase().includes(item.gas_name.toLowerCase());
      });
    },
    [inventory, normalizeSiteName]
  );

  const updateInventoryItem = useCallback(
    (id: string, updates: Partial<CalibrationGasInventoryItem>) => {
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      updateCalGasItemDb(id, updates);
    },
    []
  );

  const addInventoryItem = useCallback((item: CalibrationGasInventoryItem) => {
    setInventory((prev) => [...prev, item]);
    insertCalGasItemDb(item);
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    deleteCalGasItemDb(id);
  }, []);

  const addHistoryItems = useCallback((items: CalibrationGasHistory[]) => {
    if (items.length === 0) return;
    setHistory((prev) => [...items, ...prev]);
    insertCalGasHistoryItems(items);
  }, []);

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
      prev.map((e) => e.id === extractionId ? { ...e, [field]: value } : e)
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

      for (const exItem of extraction.items) {
        const siteUnitCandidates = extraction.matched_inventory_ids.length > 0
          ? inventory.filter((inv) => extraction.matched_inventory_ids.includes(inv.id))
          : (() => {
              const normalizedSite = normalizeSiteName(extraction.detected_site);
              let cands = inventory.filter((inv) => inv.site_name === normalizedSite);
              if (cands.length === 0) {
                cands = inventory.filter((inv) => similarity(extraction.detected_site, inv.site_name) >= 0.6);
              }
              return cands.filter((inv) =>
                inv.unit_no === extraction.detected_unit ||
                inv.unit_no.includes(extraction.detected_unit) ||
                extraction.detected_unit.includes(inv.unit_no)
              );
            })();

        const parsed = parseGasLabel(exItem.gas_name);
        let gasMatches: typeof siteUnitCandidates;
        if (parsed.gasSymbols.length > 0 && parsed.type !== "unknown") {
          const semanticResults = matchGasToInventory(
            parsed,
            siteUnitCandidates.map((c) => ({ id: c.id, gas_name: c.gas_name, concentration: c.concentration }))
          );
          const matchedIds = new Set(semanticResults.map((m) => m.inventoryId));
          gasMatches = siteUnitCandidates.filter((inv) => matchedIds.has(inv.id));
        } else {
          gasMatches = siteUnitCandidates.filter(
            (inv) =>
              inv.gas_name.toLowerCase().includes(exItem.gas_name.toLowerCase()) ||
              exItem.gas_name.toLowerCase().includes(inv.gas_name.toLowerCase())
          );
        }

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
      insertCalGasHistoryItems(newHistory);
      setExtractions((prev) =>
        prev.map((e) => (e.id === extractionId ? { ...e, status: "approved" } : e))
      );
      setUploads((prev) =>
        prev.map((u) => (u.id === extraction.upload_file_id ? { ...u, status: "applied" } : u))
      );
    },
    [extractions, inventory, normalizeSiteName, updateInventoryItem]
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
          id: crypto.randomUUID(), type, title, body, link_url,
          created_at: new Date().toISOString(), read_at: null, related_id,
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

  /* ── Check for expiry/low remaining + inspection due on mount ── */
  useEffect(() => {
    if (inventory.length === 0 || isLoading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    for (const item of inventory) {
      if (item.expiry_date) {
        const expDate = new Date(item.expiry_date);
        if (expDate <= sixtyDaysLater && expDate >= today) {
          const existing = notifications.find((n) => n.type === "expiry_soon" && n.related_id === item.id);
          if (!existing) {
            pushNotification("expiry_soon", "유효기간 임박",
              `${item.site_name} ${item.unit_no}호기 ${item.gas_name} 유효기간이 임박했습니다. (${item.expiry_date})`,
              `/calibration-gas/inventory`, item.id);
          }
        }
      }
      const pct = parseInt(item.remaining_percent);
      if (!isNaN(pct) && pct < 30) {
        const existing = notifications.find((n) => n.type === "low_remaining" && n.related_id === item.id);
        if (!existing) {
          pushNotification("low_remaining", "잔량 부족",
            `${item.site_name} ${item.unit_no}호기 ${item.gas_name} 잔량이 ${item.remaining_percent}입니다.`,
            `/calibration-gas/inventory`, item.id);
        }
      }

      if (item.gas_inspection_next) {
        const nextDate = new Date(item.gas_inspection_next);
        if (!isNaN(nextDate.getTime()) && nextDate >= today && nextDate <= sixtyDaysLater) {
          const existing = notifications.find((n) => n.type === "gas_inspection_due" && n.related_id === `gas-${item.id}`);
          if (!existing) {
            pushNotification("gas_inspection_due", "가스상 정도검사 예정 알림",
              `아래 사업장의 가스상 정도검사 유효기간이 만료 예정 (60일 전)입니다.\n\n사업장명: ${item.site_name}\n호기: ${item.unit_no}\n가스상 정도검사 예정일: ${item.gas_inspection_next}`,
              `/calibration-gas/inventory`, `gas-${item.id}`);
          }
        }
      }

      if (item.velocity_inspection_next) {
        const nextDate = new Date(item.velocity_inspection_next);
        if (!isNaN(nextDate.getTime()) && nextDate >= today && nextDate <= sixtyDaysLater) {
          const existing = notifications.find((n) => n.type === "velocity_inspection_due" && n.related_id === `vel-${item.id}`);
          if (!existing) {
            pushNotification("velocity_inspection_due", "유속계 정도검사 예정 알림",
              `아래 사업장의 유속계 정도검사 유효기간이 만료 예정 (60일 전)입니다.\n\n사업장명: ${item.site_name}\n호기: ${item.unit_no}\n유속계 정도검사 예정일: ${item.velocity_inspection_next}`,
              `/calibration-gas/inventory`, `vel-${item.id}`);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <CalGasContext.Provider
      value={{
        inventory, uploads, extractions, history, notifications, isLoading,
        updateInventoryItem, addInventoryItem, deleteInventoryItem, addHistoryItems,
        addUploadFile, addExtraction, updateExtractionField, updateExtractionItem,
        setExtractionMatchedIds, approveExtraction, rejectExtraction,
        markCalGasNotificationRead, markAllCalGasNotificationsRead,
        normalizeSiteName, findMatchingInventory,
      }}
    >
      {children}
    </CalGasContext.Provider>
  );
}
