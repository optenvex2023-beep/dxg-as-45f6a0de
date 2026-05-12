import React, { useState, useMemo, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, Clock, ChevronRight, Pencil, Save, CheckCircle2, X, Plus, Gauge, Zap, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { CalibrationGasInventoryItem } from "@/types/calibrationGas";
import type { CalibrationGasHistory } from "@/types/calibrationGas";
import { toast } from "sonner";
import { calcFirstEntry, calcCompletion, isWithin60Days, isDueOrPast } from "@/lib/inspectionCycleLogic";
import InspectionCompleteDialog from "@/components/InspectionCompleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCellMemos } from "@/hooks/useCellMemos";
import { CellMemoWrapper } from "@/components/calibration-gas/CellMemoWrapper";
import { CellMemoDialog } from "@/components/calibration-gas/CellMemoDialog";

/** Columns that support cell memos: 분석기 Range ~ 유속계 S/O 발행 */
const MEMO_ENABLED_COLUMNS: ReadonlySet<string> = new Set([
  "analyzer_range",
  "concentration", "volume_L", "expiry_date", "remaining_percent",
  "purchase_entity", "so_issue", "arrival_status",
  "gas_inspection_first", "gas_inspection_last", "gas_inspection_next",
  "gas_inspection_round", "gas_inspection_so", "gas_inspection_so_arrival",
  "velocity_inspection_first", "velocity_inspection_last", "velocity_inspection_next",
  "velocity_inspection_round", "velocity_inspection_so",
]);

const FIELD_LABELS: Record<string, string> = {
  concentration: "농도", volume_L: "용량(L)", expiry_date: "유효기간", remaining_percent: "잔량(%)",
  purchase_entity: "구매주체", so_issue: "S/O 발행", arrival_status: "도착예정", branch: "지점",
  gas_inspection_first: "가스상검사-최초", gas_inspection_last: "가스상검사-최종", gas_inspection_next: "가스상검사-예정",
  gas_inspection_round: "가스상검사-차수", gas_inspection_so: "가스상검사-S/O", gas_inspection_so_arrival: "가스상검사-S/O도착",
  velocity_inspection_first: "유속계검사-최초", velocity_inspection_last: "유속계검사-최종", velocity_inspection_next: "유속계검사-예정",
  velocity_inspection_round: "유속계검사-차수", velocity_inspection_so: "유속계검사-S/O",
  inspection_notes: "비고사항", inspection_date: "점검일", inspection_cycle: "점검주기",
  md: "M/D", monthly_amount: "월 금액", contract_consumables: "소모품", notes: "비고",
  contract_end_date: "계약종료일", site_name: "사업장명", tms_status: "TMS", unit_no: "호기",
  analyzer_range: "분석기 Range", gas_name: "가스명",
};

const EDITABLE_FIELDS: (keyof CalibrationGasInventoryItem)[] = [
  "site_name", "tms_status", "unit_no", "analyzer_range",
  "concentration", "volume_L", "expiry_date", "remaining_percent",
  "purchase_entity", "so_issue", "arrival_status", "branch",
  "gas_inspection_first", "gas_inspection_last", "gas_inspection_next",
  "gas_inspection_round", "gas_inspection_so", "gas_inspection_so_arrival",
  "velocity_inspection_first", "velocity_inspection_last", "velocity_inspection_next",
  "velocity_inspection_round", "velocity_inspection_so",
  "inspection_notes", "inspection_date", "inspection_cycle",
  "md", "monthly_amount", "contract_consumables", "notes",
];

type CompletionTarget = { itemId: string; type: "gas" | "velocity" } | null;
type InlineAddTarget = { site_name: string; tms_status: string; unit_no: string; contract_end_date: string | null; mode: "range" | "unit" } | null;
type AlertFilterType = "all" | "expiry" | "low" | "gas_insp" | "vel_insp";

const NEW_ROW_FIELDS: { key: keyof CalibrationGasInventoryItem; label: string; required?: boolean }[] = [
  { key: "site_name", label: "사업장명", required: true },
  { key: "tms_status", label: "TMS 전송유무" },
  { key: "unit_no", label: "호기", required: true },
  { key: "analyzer_range", label: "분석기 Range", required: true },
  { key: "concentration", label: "농도" },
  { key: "volume_L", label: "용량(L)" },
  { key: "expiry_date", label: "유효기간" },
  { key: "remaining_percent", label: "잔량(%)" },
  { key: "purchase_entity", label: "구매주체" },
  { key: "so_issue", label: "S/O 발행" },
  { key: "arrival_status", label: "도착예정" },
  { key: "branch", label: "지점" },
  { key: "contract_end_date", label: "계약종료일" },
  { key: "notes", label: "비고" },
];

function createEmptyItem(): CalibrationGasInventoryItem {
  return {
    id: crypto.randomUUID(),
    contract_end_date: "", site_name: "", tms_status: "", unit_no: "",
    analyzer_range: "", gas_name: "", concentration: "", volume_L: "",
    expiry_date: "", remaining_percent: "", purchase_entity: "", so_issue: "",
    arrival_status: "", branch: "",
    gas_inspection_first: "", gas_inspection_last: "", gas_inspection_next: "",
    gas_inspection_round: "", gas_inspection_so: "", gas_inspection_so_arrival: "",
    velocity_inspection_first: "", velocity_inspection_last: "", velocity_inspection_next: "",
    velocity_inspection_round: "", velocity_inspection_so: "",
    inspection_notes: "", inspection_date: "", inspection_cycle: "",
    md: "", monthly_amount: "", contract_consumables: "", notes: "",
    gas_inspection_merge_group: 0, velocity_inspection_merge_group: 0,
  };
}

export default function CalibrationGasInventory() {

  const { inventory, updateInventoryItem, addInventoryItem, deleteInventoryItem, addHistoryItems, cellMerges, mergeCells, unmergeCells } = useCalGas();
  const { currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState<AlertFilterType>("all");
  const [editMode, setEditMode] = useState(false);
  const [editBuffer, setEditBuffer] = useState<Record<string, Partial<CalibrationGasInventoryItem>>>({});
  const [completionTarget, setCompletionTarget] = useState<CompletionTarget>(null);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [newRow, setNewRow] = useState<CalibrationGasInventoryItem>(createEmptyItem);
  const [deleteTarget, setDeleteTarget] = useState<CalibrationGasInventoryItem | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [inlineAddTarget, setInlineAddTarget] = useState<InlineAddTarget>(null);
  const [inlineAddRange, setInlineAddRange] = useState("");

  /* ── Cell merge mode (Excel-like) ── */
  const [mergeMode, setMergeMode] = useState(false);
  const [selection, setSelection] = useState<{ colKey: string; startIdx: number; endIdx: number } | null>(null);

  /* ── Cell memo state ── */
  const { getMemo, saveMemo } = useCellMemos();
  const [memoTarget, setMemoTarget] = useState<{ rowId: string; colKey: string; label: string } | null>(null);
  const memoTargetMemo = memoTarget ? getMemo(memoTarget.rowId, memoTarget.colKey) : undefined;

  const handleSaveMemo = useCallback(async (text: string) => {
    if (!memoTarget) return;
    try {
      await saveMemo(memoTarget.rowId, memoTarget.colKey, text, currentUser?.name || "시스템");
      toast.success(text.trim() ? "메모가 저장되었습니다." : "메모가 삭제되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("메모 저장에 실패했습니다.");
    }
  }, [memoTarget, saveMemo, currentUser]);

  const openMemoFor = useCallback((item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem) => {
    const colKey = field as string;
    if (!MEMO_ENABLED_COLUMNS.has(colKey)) return;
    const label = `${item.site_name} / ${item.unit_no}호기 / ${item.analyzer_range || "-"} · ${FIELD_LABELS[colKey] || colKey}`;
    setMemoTarget({ rowId: item.id, colKey, label });
  }, []);

  const sites = useMemo(() => {
    const s = new Set(inventory.map((i) => i.site_name));
    return Array.from(s).sort();
  }, [inventory]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixtyDaysLater = new Date(today);
  sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      if (siteFilter !== "all" && item.site_name !== siteFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${item.site_name} ${item.unit_no} ${item.gas_name} ${item.concentration}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (alertFilter === "expiry") {
        if (!item.expiry_date) return false;
        const exp = new Date(item.expiry_date);
        if (!(exp <= sixtyDaysLater && exp >= today)) return false;
      }
      if (alertFilter === "low") {
        const pct = parseInt(item.remaining_percent);
        if (isNaN(pct) || pct >= 30) return false;
      }
      if (alertFilter === "gas_insp") {
        if (!isWithin60Days(item.gas_inspection_next)) return false;
      }
      if (alertFilter === "vel_insp") {
        if (!isWithin60Days(item.velocity_inspection_next)) return false;
      }
      return true;
    });
  }, [inventory, siteFilter, search, alertFilter, today, sixtyDaysLater]);

  const isExpirySoon = (d: string | null) => {
    if (!d) return false;
    const exp = new Date(d);
    return exp <= sixtyDaysLater && exp >= today;
  };

  const isLowRemaining = (r: string) => {
    const pct = parseInt(r);
    return !isNaN(pct) && pct < 30;
  };

  /* ── Row span calculation ── */
  const rowSpanData = useMemo(() => {
    const calcGroupSpan = (i: number, groupKey: (item: CalibrationGasInventoryItem) => number) => {
      const g = groupKey(filtered[i]);
      if (i > 0 && groupKey(filtered[i - 1]) === g) return 0;
      let span = 1;
      for (let j = i + 1; j < filtered.length && groupKey(filtered[j]) === g; j++) span++;
      return span;
    };
    // 사업장(site_name) 경계를 절대 넘지 않는 병합 계산 — 가스/유속 정도검사용
    const calcGroupSpanWithinSite = (i: number, groupKey: (item: CalibrationGasInventoryItem) => number) => {
      const cur = filtered[i];
      const g = groupKey(cur);
      if (i > 0 && filtered[i - 1].site_name === cur.site_name && groupKey(filtered[i - 1]) === g) return 0;
      let span = 1;
      for (let j = i + 1; j < filtered.length
        && filtered[j].site_name === cur.site_name
        && groupKey(filtered[j]) === g; j++) span++;
      return span;
    };

    const spans: { site: number; tms: number; unit: number; gas: number; vel: number; purchase: number; branch: number }[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const cur = filtered[i];
      let siteSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== cur.site_name) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === cur.site_name; j++) siteSpan++;
      } else { siteSpan = 0; }

      let tmsSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== cur.site_name || filtered[i - 1].tms_status !== cur.tms_status) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === cur.site_name && filtered[j].tms_status === cur.tms_status; j++) tmsSpan++;
      } else { tmsSpan = 0; }

      let unitSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== cur.site_name || filtered[i - 1].tms_status !== cur.tms_status || filtered[i - 1].unit_no !== cur.unit_no) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === cur.site_name && filtered[j].tms_status === cur.tms_status && filtered[j].unit_no === cur.unit_no; j++) unitSpan++;
      } else { unitSpan = 0; }

      const gasSpan = calcGroupSpanWithinSite(i, (it) => it.gas_inspection_merge_group ?? 0);
      const velSpan = calcGroupSpanWithinSite(i, (it) => it.velocity_inspection_merge_group ?? 0);
      // 구매주체: 같은 사업장(site_name) 내에서만 병합 — 사업장 경계를 절대 넘지 않도록 제한
      let purchase = 1;
      const curPurchaseGid = cur.purchase_entity_merge_group ?? 0;
      const prevPurchaseGid = i > 0 ? (filtered[i - 1].purchase_entity_merge_group ?? 0) : -1;
      if (i > 0 && filtered[i - 1].site_name === cur.site_name && prevPurchaseGid === curPurchaseGid) {
        purchase = 0;
      } else {
        for (let j = i + 1; j < filtered.length
          && filtered[j].site_name === cur.site_name
          && (filtered[j].purchase_entity_merge_group ?? 0) === curPurchaseGid; j++) {
          purchase++;
        }
      }
      const branch = calcGroupSpan(i, (it) => it.branch_merge_group ?? 0);

      spans.push({ site: siteSpan, tms: tmsSpan, unit: unitSpan, gas: gasSpan, vel: velSpan, purchase, branch });
    }
    return spans;
  }, [filtered]);

  /* Manual cell-merge spans (override per column) */
  const manualSpans = useMemo(() => {
    const result: Record<string, (number | undefined)[]> = {};
    for (const colKey of Object.keys(cellMerges)) {
      const colMap = cellMerges[colKey];
      const arr: (number | undefined)[] = new Array(filtered.length).fill(undefined);
      let i = 0;
      while (i < filtered.length) {
        const gid = colMap[filtered[i].id];
        if (!gid) { i++; continue; }
        const siteName = filtered[i].site_name;
        let j = i + 1;
        while (j < filtered.length && filtered[j].site_name === siteName && colMap[filtered[j].id] === gid) j++;
        if (j - i >= 2) {
          arr[i] = j - i;
          for (let k = i + 1; k < j; k++) arr[k] = 0;
        }
        i = j;
      }
      result[colKey] = arr;
    }
    return result;
  }, [cellMerges, filtered]);

  const getManualSpan = useCallback((colKey: string, idx: number): number | undefined => {
    return manualSpans[colKey]?.[idx];
  }, [manualSpans]);

  const effectiveSpan = useCallback((colKey: string, idx: number, autoSpan: number): number => {
    const m = getManualSpan(colKey, idx);
    if (m !== undefined) return m;
    return autoSpan;
  }, [getManualSpan]);

  /* Cell selection (merge mode) */
  const handleCellClick = useCallback((colKey: string, idx: number, e: React.MouseEvent) => {
    if (!mergeMode) return;
    e.stopPropagation();
    if (selection && selection.colKey === colKey) {
      setSelection({ colKey, startIdx: Math.min(selection.startIdx, idx), endIdx: Math.max(selection.startIdx, idx) });
    } else {
      setSelection({ colKey, startIdx: idx, endIdx: idx });
    }
  }, [mergeMode, selection]);

  const isCellInSelection = useCallback((colKey: string, idx: number) => {
    if (!selection || selection.colKey !== colKey) return false;
    return idx >= selection.startIdx && idx <= selection.endIdx;
  }, [selection]);

  const handleMergeSelection = useCallback(async () => {
    if (!selection) return;
    const { colKey, startIdx, endIdx } = selection;
    if (endIdx <= startIdx) {
      toast.error("2개 이상의 셀을 선택해주세요.");
      return;
    }
    const siteName = filtered[startIdx].site_name;
    const ids: string[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      if (filtered[i].site_name !== siteName) {
        toast.error("같은 사업장 안에서만 병합할 수 있습니다.");
        return;
      }
      ids.push(filtered[i].id);
    }
    await mergeCells(colKey, ids, currentUser?.name || "시스템");
    toast.success(`${ids.length}개 셀이 병합되었습니다.`);
    setSelection(null);
  }, [selection, filtered, mergeCells, currentUser]);

  const handleUnmergeSelection = useCallback(async () => {
    if (!selection) return;
    const { colKey, startIdx, endIdx } = selection;
    const colMap = cellMerges[colKey] || {};
    const gidsToClear = new Set<string>();
    for (let i = startIdx; i <= endIdx; i++) {
      const g = colMap[filtered[i].id];
      if (g) gidsToClear.add(g);
    }
    if (gidsToClear.size === 0) {
      toast.error("병합된 셀이 없습니다.");
      return;
    }
    const ids: string[] = [];
    for (const item of filtered) {
      if (gidsToClear.has(colMap[item.id])) ids.push(item.id);
    }
    await unmergeCells(colKey, ids);
    toast.success("병합이 해제되었습니다.");
    setSelection(null);
  }, [selection, filtered, cellMerges, unmergeCells]);

  const selectionHasMerge = useMemo(() => {
    if (!selection) return false;
    const colMap = cellMerges[selection.colKey] || {};
    for (let i = selection.startIdx; i <= selection.endIdx; i++) {
      if (colMap[filtered[i]?.id]) return true;
    }
    return false;
  }, [selection, cellMerges, filtered]);


  /* ── Edit handlers ── */
  const handleStartEdit = useCallback(() => {
    setEditBuffer({});
    setEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditBuffer({});
    setEditMode(false);
    toast.info("편집이 취소되었습니다.");
  }, []);

  const handleSave = useCallback(() => {
    let count = 0;
    const now = new Date().toISOString();
    const userName = currentUser?.name || "시스템";
    const newHistory: CalibrationGasHistory[] = [];

    for (const [id, updates] of Object.entries(editBuffer)) {
      if (Object.keys(updates).length > 0) {
        const item = inventory.find((i) => i.id === id);
        if (updates.gas_inspection_first) {
          if (item && !item.gas_inspection_last && !updates.gas_inspection_last) {
            const auto = calcFirstEntry(updates.gas_inspection_first);
            updates.gas_inspection_next = auto.next;
            updates.gas_inspection_round = auto.round;
          }
        }
        if (updates.velocity_inspection_first) {
          if (item && !item.velocity_inspection_last && !updates.velocity_inspection_last) {
            const auto = calcFirstEntry(updates.velocity_inspection_first);
            updates.velocity_inspection_next = auto.next;
            updates.velocity_inspection_round = auto.round;
          }
        }
        updateInventoryItem(id, updates);
        count++;

        // Record history for each changed field
        if (item) {
          for (const [field, newVal] of Object.entries(updates)) {
            const oldVal = (item[field as keyof CalibrationGasInventoryItem] as string) ?? "";
            const newValStr = String(newVal ?? "");
            if (oldVal !== newValStr) {
              newHistory.push({
                id: crypto.randomUUID(),
                inventory_item_id: id,
                file_name: "현황표 수정",
                field_name: FIELD_LABELS[field] || field,
                before_value: oldVal,
                after_value: newValStr,
                updated_at: now,
                updated_by: userName,
              });
            }
          }
        }
      }
    }
    addHistoryItems(newHistory);
    setEditMode(false);
    setEditBuffer({});
    toast.success(`${count}건의 항목이 저장되었습니다.`);
  }, [editBuffer, updateInventoryItem, inventory, addHistoryItems, currentUser]);

  const handleCellChange = useCallback((itemId: string, field: keyof CalibrationGasInventoryItem, value: string) => {
    setEditBuffer((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  }, []);

  const getCellValue = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem): string => {
    const buf = editBuffer[item.id];
    if (buf && field in buf) return (buf[field] as string) ?? "";
    return (item[field] as string) ?? "";
  };

  /* ── Inspection completion handler ── */
  const handleInspectionComplete = useCallback((dateStr: string) => {
    if (!completionTarget) return;
    const { itemId, type } = completionTarget;
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const now = new Date().toISOString();
    const userName = currentUser?.name || "시스템";
    const newHistory: CalibrationGasHistory[] = [];

    if (type === "gas") {
      const currentRound = item.gas_inspection_round || "1차";
      const result = calcCompletion(dateStr, currentRound);
      updateInventoryItem(itemId, {
        gas_inspection_last: result.last,
        gas_inspection_next: result.next,
        gas_inspection_round: result.round,
      });
      newHistory.push({
        id: crypto.randomUUID(), inventory_item_id: itemId,
        file_name: "가스상 정도검사 완료", field_name: "최종→예정",
        before_value: `최종: ${item.gas_inspection_last || "-"}, 예정: ${item.gas_inspection_next || "-"}`,
        after_value: `최종: ${result.last}, 예정: ${result.next} (${result.round})`,
        updated_at: now, updated_by: userName,
      });
      toast.success(`가스상 정도검사 완료: 다음 예정일 ${result.next} (${result.round})`);
    } else {
      const currentRound = item.velocity_inspection_round || "1차";
      const result = calcCompletion(dateStr, currentRound);
      updateInventoryItem(itemId, {
        velocity_inspection_last: result.last,
        velocity_inspection_next: result.next,
        velocity_inspection_round: result.round,
      });
      newHistory.push({
        id: crypto.randomUUID(), inventory_item_id: itemId,
        file_name: "유속계 정도검사 완료", field_name: "최종→예정",
        before_value: `최종: ${item.velocity_inspection_last || "-"}, 예정: ${item.velocity_inspection_next || "-"}`,
        after_value: `최종: ${result.last}, 예정: ${result.next} (${result.round})`,
        updated_at: now, updated_by: userName,
      });
      toast.success(`유속계 정도검사 완료: 다음 예정일 ${result.next} (${result.round})`);
    }
    addHistoryItems(newHistory);
    setCompletionTarget(null);
  }, [completionTarget, inventory, updateInventoryItem, addHistoryItems, currentUser]);

  /* ── Add row handler ── */
  const handleAddRow = useCallback(() => {
    if (!newRow.site_name.trim() || !newRow.unit_no.trim() || !newRow.analyzer_range.trim()) {
      toast.error("사업장명, 호기, 분석기 Range는 필수입니다.");
      return;
    }
    const newId = crypto.randomUUID();

    // Determine sort_order: find max sort_order among same site_name rows,
    // or overall max if it's a brand new site
    const sameSiteRows = inventory.filter((i) => i.site_name === newRow.site_name.trim());
    let newSortOrder: number;
    if (sameSiteRows.length > 0) {
      // Existing site: place right after the last row of that site
      const maxSiteSortOrder = Math.max(...sameSiteRows.map((r) => r.sort_order ?? 0));
      // Also need to ensure we don't collide with rows between site groups
      // Use maxSiteSortOrder + 1 and shift any rows after if needed
      newSortOrder = maxSiteSortOrder + 1;
    } else {
      // New site: place at the very end
      const maxOverall = inventory.length > 0 ? Math.max(...inventory.map((r) => r.sort_order ?? 0)) : 0;
      newSortOrder = maxOverall + 1;
    }

    // Copy shared fields from existing site rows (contract_end_date, tms_status) if not provided
    const itemToAdd: CalibrationGasInventoryItem = {
      ...newRow,
      id: newId,
      gas_name: newRow.analyzer_range, // Use analyzer_range as gas_name
      sort_order: newSortOrder,
    };

    if (sameSiteRows.length > 0) {
      // Inherit site-level fields if user didn't provide them
      const ref = sameSiteRows[0];
      if (!itemToAdd.contract_end_date) itemToAdd.contract_end_date = ref.contract_end_date;
      if (!itemToAdd.tms_status) itemToAdd.tms_status = ref.tms_status;
    }

    addInventoryItem(itemToAdd);

    const now = new Date().toISOString();
    const userName = currentUser?.name || "시스템";
    const isExistingSite = sameSiteRows.length > 0;
    addHistoryItems([{
      id: crypto.randomUUID(), inventory_item_id: newId,
      file_name: isExistingSite ? "현황표 Range 추가" : "현황표 신규등록",
      field_name: isExistingSite ? "Range 추가" : "신규등록",
      before_value: "",
      after_value: `${newRow.site_name} / ${newRow.unit_no} / ${newRow.analyzer_range}`,
      updated_at: now, updated_by: userName,
    }]);

    setNewRow(createEmptyItem());
    setAddRowOpen(false);
    toast.success(isExistingSite ? "기존 사업장에 Range가 추가되었습니다." : "새 항목이 추가되었습니다.");
  }, [newRow, addInventoryItem, addHistoryItems, currentUser, inventory]);

  /* ── Delete row handler ── */
  const handleDeleteRow = useCallback(() => {
    if (!deleteTarget) return;
    const now = new Date().toISOString();
    const userName = currentUser?.name || "시스템";
    addHistoryItems([{
      id: crypto.randomUUID(), inventory_item_id: deleteTarget.id,
      file_name: "현황표 삭제", field_name: "삭제",
      before_value: `${deleteTarget.site_name} / ${deleteTarget.unit_no} / ${deleteTarget.analyzer_range}`,
      after_value: "",
      updated_at: now, updated_by: userName,
    }]);
    deleteInventoryItem(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("항목이 삭제되었습니다.");
  }, [deleteTarget, deleteInventoryItem, addHistoryItems, currentUser]);

  /* ── Inline add (Range or Unit) handler ── */
  const handleInlineAdd = useCallback(() => {
    if (!inlineAddTarget || !inlineAddRange.trim()) {
      toast.error(inlineAddTarget?.mode === "unit" ? "호기를 입력하세요." : "분석기 Range를 입력하세요.");
      return;
    }
    const newId = crypto.randomUUID();
    const { site_name, tms_status, contract_end_date, unit_no, mode } = inlineAddTarget;
    const actualUnitNo = mode === "unit" ? inlineAddRange.trim() : unit_no;
    const actualRange = mode === "unit" ? "" : inlineAddRange.trim();

    const sameSiteRows = inventory.filter((i) => i.site_name === site_name);
    const maxSiteSortOrder = sameSiteRows.length > 0 ? Math.max(...sameSiteRows.map((r) => r.sort_order ?? 0)) : 0;

    const itemToAdd: CalibrationGasInventoryItem = {
      ...createEmptyItem(),
      id: newId,
      site_name,
      tms_status,
      contract_end_date,
      unit_no: actualUnitNo,
      analyzer_range: actualRange,
      gas_name: actualRange,
      sort_order: maxSiteSortOrder + 1,
    };

    addInventoryItem(itemToAdd);

    const now = new Date().toISOString();
    const userName = currentUser?.name || "시스템";
    addHistoryItems([{
      id: crypto.randomUUID(), inventory_item_id: newId,
      file_name: mode === "unit" ? "현황표 호기 추가" : "현황표 Range 추가",
      field_name: mode === "unit" ? "호기 추가" : "Range 추가",
      before_value: "",
      after_value: mode === "unit" ? `${site_name} / ${actualUnitNo}` : `${site_name} / ${unit_no} / ${actualRange}`,
      updated_at: now, updated_by: userName,
    }]);

    setInlineAddTarget(null);
    setInlineAddRange("");
    toast.success(mode === "unit" ? "새 호기가 추가되었습니다." : "분석기 Range가 추가되었습니다.");
  }, [inlineAddTarget, inlineAddRange, inventory, addInventoryItem, addHistoryItems, currentUser]);
  /* ── Shared styles ── */
  const thBase = "whitespace-nowrap font-bold text-table-header-foreground bg-table-header border-r border-b border-white/20 py-2 px-2 text-center text-[11px]";
  const td = "text-[11px] border-r border-border/30 py-1.5 px-2 align-middle group-hover:bg-accent/40 whitespace-normal break-words";
  const pinkBg = "bg-pink-100 dark:bg-pink-950/40";
  const greenBg = "bg-lime-200 dark:bg-lime-900/50";

  /* ── Sticky column styles (left-pinned) ── */
  const stickyTh = "sticky z-30 bg-table-header border-r border-border";
  const stickyTd = "sticky z-10 bg-background border-r border-border outline-none ring-0 shadow-none";
  // Cumulative left offsets: 사업장명(90) + TMS(60) + 호기(70) + Range(100)
  // (계약종료일 컬럼 제거됨 — 인덱스 0은 더미로 유지하지만 사용하지 않음)
  const stickyCol = [
    { left: "left-0", w: "w-[80px] min-w-[80px] max-w-[80px]" },        // (사용 안 함)
    { left: "left-0", w: "w-[90px] min-w-[90px] max-w-[90px]" },         // 사업장명
    { left: "left-[90px]", w: "w-[60px] min-w-[60px] max-w-[60px]" },    // TMS
    { left: "left-[150px]", w: "w-[70px] min-w-[70px] max-w-[70px]" },   // 호기
    { left: "left-[220px]", w: "w-[140px] min-w-[140px] max-w-[140px]" }, // 분석기 Range
  ] as const;
  const stickyBorderRight = "border-r-2 border-r-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]";

  /** Helper: wrap a cell's inner content with memo trigger + indicator if applicable */
  const wrapMemo = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem, content: React.ReactNode) => {
    const colKey = field as string;
    if (!MEMO_ENABLED_COLUMNS.has(colKey)) return content;
    const memo = getMemo(item.id, colKey);
    return (
      <CellMemoWrapper hasMemo={!!memo} onOpenMemo={() => openMemoFor(item, field)}>
        {content}
      </CellMemoWrapper>
    );
  };

  /** Get classes/handlers for cell selection in merge mode */
  const cellMergeProps = (colKey: string, idx: number) => {
    if (!mergeMode) return { className: "", onClick: undefined as undefined | ((e: React.MouseEvent) => void) };
    const selected = isCellInSelection(colKey, idx);
    return {
      className: `cursor-cell ${selected ? "outline outline-2 outline-blue-500 outline-offset-[-2px] !bg-blue-100 dark:!bg-blue-900/40" : ""}`,
      onClick: (e: React.MouseEvent) => handleCellClick(colKey, idx, e),
    };
  };

  /** Render a plain cell (rowspan = manual override or 1) */
  const renderCell = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem, idx: number, extraClass = "") => {
    const colKey = field as string;
    const manual = getManualSpan(colKey, idx);
    if (manual === 0) return null;
    const span = manual && manual > 1 ? manual : undefined;
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    const sel = cellMergeProps(colKey, idx);
    if (isEditable) {
      return (
        <td rowSpan={span} className={`${td} ${extraClass} p-0.5 ${sel.className}`} onClick={sel.onClick}>
          {wrapMemo(item, field,
            <input
              className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              value={val}
              onChange={(e) => handleCellChange(item.id, field, e.target.value)}
            />
          )}
        </td>
      );
    }
    return <td rowSpan={span} className={`${td} ${extraClass} ${sel.className}`} onClick={sel.onClick}>{wrapMemo(item, field, <>{val || ""}</>)}</td>;
  };

  /** Render a merged (rowspan) cell with optional manual override */
  const renderMergedCell = (
    item: CalibrationGasInventoryItem,
    field: keyof CalibrationGasInventoryItem,
    autoSpan: number,
    idx: number,
    extraClass = ""
  ) => {
    const colKey = field as string;
    const manual = getManualSpan(colKey, idx);
    const span = manual !== undefined ? manual : autoSpan;
    if (span === 0) return null;
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    const sel = cellMergeProps(colKey, idx);
    if (isEditable) {
      return (
        <td rowSpan={span} className={`${td} ${extraClass} p-0.5 ${sel.className}`} onClick={sel.onClick}>
          {wrapMemo(item, field,
            <input
              className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              value={val}
              onChange={(e) => handleCellChange(item.id, field, e.target.value)}
            />
          )}
        </td>
      );
    }
    return <td rowSpan={span} className={`${td} ${extraClass} ${sel.className}`} onClick={sel.onClick}>{wrapMemo(item, field, <>{val || ""}</>)}</td>;
  };

  const gasInspectionDue = (item: CalibrationGasInventoryItem) => isWithin60Days(item.gas_inspection_next);
  const velocityInspectionDue = (item: CalibrationGasInventoryItem) => isWithin60Days(item.velocity_inspection_next);
  const gasInspDueOrPast = (item: CalibrationGasInventoryItem) => isDueOrPast(item.gas_inspection_next);
  const velInspDueOrPast = (item: CalibrationGasInventoryItem) => isDueOrPast(item.velocity_inspection_next);

  const FILTER_OPTIONS: { key: AlertFilterType; label: string; Icon: typeof Clock | null }[] = [
    { key: "all", label: "전체", Icon: null },
    { key: "expiry", label: "유효기간 임박", Icon: Clock },
    { key: "low", label: "잔량 부족", Icon: AlertTriangle },
    { key: "gas_insp", label: "가스상 검사 60일전", Icon: Gauge },
    { key: "vel_insp", label: "유속계 검사 60일전", Icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Title + Action Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">교정가스 현황표</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{filtered.length}</span>건
          </span>
          <Button size="sm" variant={isAddMode ? "default" : "outline"} onClick={() => setIsAddMode((v) => !v)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {isAddMode ? "추가모드 해제" : "행 추가"}
          </Button>
          <Button size="sm" variant={mergeMode ? "default" : "outline"} onClick={() => { setMergeMode((v) => !v); setSelection(null); }} className="gap-1.5">
            {mergeMode ? "병합모드 해제" : "셀 병합"}
          </Button>
          {mergeMode && selection && (
            <>
              {selectionHasMerge ? (
                <Button size="sm" variant="destructive" onClick={handleUnmergeSelection} className="gap-1.5">
                  병합 해제
                </Button>
              ) : (
                <Button size="sm" onClick={handleMergeSelection} disabled={selection.endIdx === selection.startIdx} className="gap-1.5">
                  병합 ({selection.endIdx - selection.startIdx + 1}행)
                </Button>
              )}
            </>
          )}
          {!editMode ? (
            <Button size="sm" onClick={handleStartEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> 등록
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> 취소
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> 저장
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-3 bg-muted/30 rounded-lg border">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="사업장, 호기, 가스명 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background h-8 text-sm" />
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[160px] bg-background h-8 text-sm">
            <SelectValue placeholder="사업장 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 사업장</SelectItem>
            {sites.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setAlertFilter(key)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${alertFilter === key ? (key === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-destructive text-destructive-foreground border-destructive") : "bg-background text-foreground hover:bg-muted"}`}>
              {Icon && <Icon className="h-3 w-3" />} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronRight className="h-3 w-3" />
        <span>테이블을 좌우로 스크롤하여 모든 컬럼을 확인하세요</span>
        {editMode && <Badge variant="secondary" className="ml-2 text-[10px]">편집 모드</Badge>}
        {isAddMode && (
          <>
            <Badge variant="default" className="ml-2 text-[10px]">추가 모드</Badge>
            <Button size="sm" variant="outline" onClick={() => setAddRowOpen(true)} className="ml-2 gap-1 h-6 text-[10px] px-2">
              <Plus className="h-3 w-3" /> 신규 사업장 추가
            </Button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-background shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]" style={{ scrollbarGutter: "stable" }}>
          <table className="min-w-[3600px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
              <tr className="bg-table-header">
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[1].left} ${stickyCol[1].w} overflow-hidden text-ellipsis`}>사업장명</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[2].left} ${stickyCol[2].w}`}>TMS</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[3].left} ${stickyCol[3].w}`}>호기</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[4].left} ${stickyCol[4].w} ${stickyBorderRight}`}>분석기 Range</th>
                <th colSpan={2} className={`${thBase}`}>교정가스</th>
                <th colSpan={2} className={`${thBase}`}>사업장 보유 가스</th>
                <th rowSpan={2} className={`${thBase} min-w-[52px] w-[52px]`}>구매주체</th>
                <th rowSpan={2} className={`${thBase} min-w-[40px] w-[40px]`}>S/O 발행</th>
                <th rowSpan={2} className={`${thBase} min-w-[35px] w-[35px]`}>도착예정</th>
                <th colSpan={7} className={`${thBase} bg-table-header-gas`}>가스상 정도검사</th>
                <th colSpan={6} className={`${thBase} bg-table-header-velocity`}>유속계 정도검사</th>
                <th rowSpan={2} className={`${thBase} min-w-[110px] w-[110px] max-w-[110px] border-r-0`}>비고사항</th>
                <th rowSpan={2} className={`${thBase} min-w-[40px] border-r-0`}></th>
              </tr>
              <tr className="bg-table-header">
                <th className={`${thBase} min-w-[40px] w-[40px]`}>농도</th>
                <th className={`${thBase} min-w-[32px] w-[32px]`}>용량(L)</th>
                <th className={`${thBase} min-w-[82px] w-[82px]`}>유효기간</th>
                <th className={`${thBase} min-w-[76px] w-[76px] max-w-[76px]`}>잔량</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-gas`}>최초</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-gas`}>최종</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-gas`}>예정</th>
                <th className={`${thBase} min-w-[32px] w-[32px] bg-table-header-gas`}>차수</th>
                <th className={`${thBase} min-w-[96px] w-[96px] bg-table-header-gas`}>예정/완료</th>
                <th className={`${thBase} min-w-[24px] w-[24px] bg-table-header-gas`}>S/O발행</th>
                <th className={`${thBase} min-w-[25px] w-[25px] bg-table-header-gas`}>S/O도착</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-velocity`}>최초</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-velocity`}>최종</th>
                <th className={`${thBase} min-w-[58px] w-[58px] bg-table-header-velocity`}>예정</th>
                <th className={`${thBase} min-w-[32px] w-[32px] bg-table-header-velocity`}>차수</th>
                <th className={`${thBase} min-w-[96px] w-[96px] bg-table-header-velocity`}>예정/완료</th>
                <th className={`${thBase} min-w-[24px] w-[24px] bg-table-header-velocity`}>S/O발행</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const expSoon = isExpirySoon(item.expiry_date);
                const lowRem = isLowRemaining(item.remaining_percent);
                const s = rowSpanData[idx];
                const gasDue = gasInspectionDue(item);
                const velDue = velocityInspectionDue(item);
                const isEvenGroup = (() => {
                  let g = 0;
                  for (let i = 0; i <= idx; i++) { if (rowSpanData[i].site > 0) g++; }
                  return g % 2 === 0;
                })();

                const rowBg = expSoon || lowRem
                  ? "bg-destructive/5"
                  : isEvenGroup ? "bg-muted/20" : "bg-background";
                const anyInspDue = gasDue || velDue;

                  const isSiteStart = s.site > 0 && idx > 0;

                // Effective spans (manual override > auto)
                const siteSpan = effectiveSpan("site_name", idx, s.site);
                const tmsSpan = effectiveSpan("tms_status", idx, s.tms);
                const unitSpan = effectiveSpan("unit_no", idx, s.unit);
                const siteSel = cellMergeProps("site_name", idx);
                const tmsSel = cellMergeProps("tms_status", idx);
                const unitSel = cellMergeProps("unit_no", idx);

                return (
                  <tr key={item.id} className={`group ${rowBg} transition-colors ${isSiteStart ? "[&>td]:shadow-[inset_0_1px_0_0_rgb(170,167,167)]" : "border-b border-border/20"}`}>
                    {/* Site-level merged (B 사업장명) */}
                    {siteSpan > 0 && (
                      <td rowSpan={siteSpan > 1 ? siteSpan : undefined} className={`${td} ${stickyTd} ${stickyCol[1].left} ${stickyCol[1].w} font-semibold whitespace-normal break-keep ${anyInspDue ? "!bg-pink-100 dark:!bg-pink-950" : "!bg-muted"} ${siteSel.className}`} onClick={siteSel.onClick}>
                        {editMode ? (
                          <input
                            className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "site_name")}
                            onChange={(e) => handleCellChange(item.id, "site_name", e.target.value)}
                          />
                        ) : (
                          <>
                            <span className="block leading-tight">{item.site_name}</span>
                            {anyInspDue && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">검사예정</Badge>}
                          </>
                        )}
                      </td>
                    )}

                    {/* TMS-level merged (C) */}
                    {tmsSpan > 0 && (
                      <td rowSpan={tmsSpan > 1 ? tmsSpan : undefined} className={`${td} ${stickyTd} ${stickyCol[2].left} ${stickyCol[2].w} text-center !bg-background ${tmsSel.className}`} onClick={tmsSel.onClick}>
                        {editMode ? (
                          <input
                            className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-center text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "tms_status")}
                            onChange={(e) => handleCellChange(item.id, "tms_status", e.target.value)}
                          />
                        ) : (
                          <Badge variant={item.tms_status === "전송" ? "default" : "secondary"} className="text-[10px] px-1.5">
                            {item.tms_status}
                          </Badge>
                        )}
                      </td>
                    )}

                    {/* Unit-level merged (D) */}
                    {unitSpan > 0 && (
                      <td rowSpan={unitSpan > 1 ? unitSpan : undefined} className={`${td} ${stickyTd} ${stickyCol[3].left} ${stickyCol[3].w} text-center font-medium !bg-background ${unitSel.className}`} onClick={unitSel.onClick}>
                        {editMode ? (
                          <input
                            className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-center text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "unit_no")}
                            onChange={(e) => handleCellChange(item.id, "unit_no", e.target.value)}
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-0.5">
                            <span>{item.unit_no}</span>
                            {isAddMode && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setInlineAddTarget({ site_name: item.site_name, tms_status: item.tms_status, unit_no: item.unit_no, contract_end_date: item.contract_end_date, mode: "unit" }); setInlineAddRange(""); }}
                                className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                                title="새 호기 추가"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}

                    {/* ── Per-gas-row columns (E): 분석기 Range ── */}
                    <td className={`${td} ${stickyTd} ${stickyCol[4].left} ${stickyCol[4].w} ${stickyBorderRight} group-hover:!bg-accent/40 whitespace-normal break-words [overflow-wrap:anywhere]`}>
                      <CellMemoWrapper hasMemo={!!getMemo(item.id, "analyzer_range")} onOpenMemo={() => openMemoFor(item, "analyzer_range")}>
                        {editMode ? (
                          <input
                            className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "analyzer_range")}
                            onChange={(e) => handleCellChange(item.id, "analyzer_range", e.target.value)}
                          />
                        ) : (
                          <div className="flex items-start gap-0.5">
                            <span className="flex-1 whitespace-normal break-words [overflow-wrap:anywhere]">{item.analyzer_range}</span>
                            {isAddMode && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setInlineAddTarget({ site_name: item.site_name, tms_status: item.tms_status, unit_no: item.unit_no, contract_end_date: item.contract_end_date, mode: "range" }); setInlineAddRange(""); }}
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                                title="같은 호기에 Range 추가"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </CellMemoWrapper>
                    </td>
                    {renderCell(item, "concentration", idx, "text-center")}
                    {renderCell(item, "volume_L", idx, "text-center")}
                    {/* Expiry date */}
                    {editMode && EDITABLE_FIELDS.includes("expiry_date") ? (
                      <td className={`${td} text-center whitespace-nowrap p-0.5`}>
                        {wrapMemo(item, "expiry_date",
                          <input
                            className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "expiry_date")}
                            onChange={(e) => handleCellChange(item.id, "expiry_date", e.target.value)}
                          />
                        )}
                      </td>
                    ) : (
                      <td className={`${td} text-center whitespace-nowrap`}>
                        {wrapMemo(item, "expiry_date",
                          <>
                            <span className={expSoon ? "text-destructive font-medium" : ""}>{item.expiry_date || "-"}</span>
                            {expSoon && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                          </>
                        )}
                      </td>
                    )}
                    {/* Remaining percent */}
                    {editMode && EDITABLE_FIELDS.includes("remaining_percent") ? (
                      <td className={`${td} text-center p-0.5 min-w-[76px] w-[76px] max-w-[76px]`}>
                        {wrapMemo(item, "remaining_percent",
                          <input
                            className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={getCellValue(item, "remaining_percent")}
                            onChange={(e) => handleCellChange(item.id, "remaining_percent", e.target.value)}
                          />
                        )}
                      </td>
                    ) : (
                      <td className={`${td} text-center min-w-[76px] w-[76px] max-w-[76px] whitespace-nowrap`}>
                        {wrapMemo(item, "remaining_percent",
                          <>
                            <span className={lowRem ? "text-destructive font-medium" : ""}>{item.remaining_percent}</span>
                            {lowRem && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">부족</Badge>}
                          </>
                        )}
                      </td>
                    )}

                    {/* ── Unit-level merged: J구매주체 ── */}
                    {renderMergedCell(item, "purchase_entity", s.purchase, idx, "text-center")}
                    {/* ── K S/O, L 도착: 개별 셀 (병합 안 함) ── */}
                    {renderCell(item, "so_issue", idx, "text-center whitespace-nowrap")}
                    {renderCell(item, "arrival_status", idx, "text-center whitespace-nowrap")}
                    {/* (지점 컬럼 제거됨) */}

                    {/* ── Gas inspection merge group: N~S 가스상 정도검사 ── */}
                    {renderMergedCell(item, "gas_inspection_first", s.gas, idx, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_last", s.gas, idx, "text-center whitespace-nowrap")}
                    {/* P: 예정 - pink if within 60 days */}
                    {s.gas > 0 && (
                      <td rowSpan={s.gas} className={`${td} text-center whitespace-nowrap ${gasInspDueOrPast(item) ? greenBg + " font-semibold" : ""}`}>
                        {wrapMemo(item, "gas_inspection_next",
                          editMode ? (
                            <input
                              className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                              value={getCellValue(item, "gas_inspection_next")}
                              onChange={(e) => handleCellChange(item.id, "gas_inspection_next", e.target.value)}
                            />
                          ) : (
                            <>
                              {item.gas_inspection_next || ""}
                              {gasDue && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                            </>
                          )
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "gas_inspection_round", s.gas, idx, "text-center")}
                    {/* 예정/완료 column */}
                    {s.gas > 0 && (
                      <td rowSpan={s.gas} className={`${td} text-center`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">예정</span>
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "gas" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors border border-blue-500/20 whitespace-nowrap"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> 완료 체크
                          </button>
                        </div>
                      </td>
                    )}
                    {renderMergedCell(item, "gas_inspection_so", s.gas, idx, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_so_arrival", s.gas, idx, "text-center whitespace-nowrap")}

                    {/* ── Velocity inspection merge group: T~X 유속계 정도검사 ── */}
                    {renderMergedCell(item, "velocity_inspection_first", s.vel, idx, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "velocity_inspection_last", s.vel, idx, "text-center whitespace-nowrap")}
                    {/* V: 예정 - pink if within 60 days */}
                    {s.vel > 0 && (
                      <td rowSpan={s.vel} className={`${td} text-center whitespace-nowrap ${velInspDueOrPast(item) ? greenBg + " font-semibold" : ""}`}>
                        {wrapMemo(item, "velocity_inspection_next",
                          editMode ? (
                            <input
                              className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                              value={getCellValue(item, "velocity_inspection_next")}
                              onChange={(e) => handleCellChange(item.id, "velocity_inspection_next", e.target.value)}
                            />
                          ) : (
                            <>
                              {item.velocity_inspection_next || ""}
                              {velDue && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                            </>
                          )
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "velocity_inspection_round", s.vel, idx, "text-center")}
                    {/* 예정/완료 column */}
                    {s.vel > 0 && (
                      <td rowSpan={s.vel} className={`${td} text-center`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">예정</span>
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "velocity" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20 transition-colors border border-green-500/20 whitespace-nowrap"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> 완료 체크
                          </button>
                        </div>
                      </td>
                    )}
                    {renderMergedCell(item, "velocity_inspection_so", s.vel, idx, "text-center whitespace-nowrap")}

                    {/* ── Unit-level merged: Y 비고사항 ── */}
                    {renderMergedCell(item, "inspection_notes", s.unit, idx, "min-w-[110px] w-[110px] max-w-[110px] whitespace-normal break-words [overflow-wrap:anywhere] leading-tight")}
                    <td className={`${td} text-center border-r-0`}>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InspectionCompleteDialog
        open={!!completionTarget}
        onClose={() => setCompletionTarget(null)}
        onConfirm={handleInspectionComplete}
        title={completionTarget?.type === "gas" ? "가스상 정도검사 완료" : "유속계 정도검사 완료"}
        description="검사 완료일을 입력하세요. 다음 예정일과 차수가 자동 계산됩니다."
      />

      {/* Cell Memo Dialog */}
      <CellMemoDialog
        open={!!memoTarget}
        onClose={() => setMemoTarget(null)}
        onSave={handleSaveMemo}
        initialMemo={memoTargetMemo?.memo ?? ""}
        cellLabel={memoTarget?.label ?? ""}
      />

      {/* Add Row Dialog */}
      <Dialog open={addRowOpen} onOpenChange={setAddRowOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 항목 추가</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {NEW_ROW_FIELDS.map(({ key, label, required }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">
                  {label} {required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  className="h-8 text-sm"
                  value={(newRow[key] as string) ?? ""}
                  onChange={(e) => setNewRow((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRowOpen(false)}>취소</Button>
            <Button onClick={handleAddRow}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>항목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.site_name}</strong> / {deleteTarget.unit_no}호기 / {deleteTarget.analyzer_range}
                  <br />이 항목을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRow} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Inline Add (Range or Unit) Dialog */}
      <Dialog open={!!inlineAddTarget} onOpenChange={(open) => { if (!open) { setInlineAddTarget(null); setInlineAddRange(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {inlineAddTarget?.mode === "unit" ? "새 호기 추가" : "같은 호기에 Range 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>사업장: <span className="font-medium text-foreground">{inlineAddTarget?.site_name}</span></p>
              {inlineAddTarget?.mode === "range" && (
                <p>호기: <span className="font-medium text-foreground">{inlineAddTarget?.unit_no}</span></p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {inlineAddTarget?.mode === "unit" ? "호기" : "분석기 Range"} <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-8 text-sm"
                value={inlineAddRange}
                onChange={(e) => setInlineAddRange(e.target.value)}
                placeholder={inlineAddTarget?.mode === "unit" ? "예: 2" : "예: SO2 Span"}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInlineAddTarget(null); setInlineAddRange(""); }}>취소</Button>
            <Button onClick={handleInlineAdd}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
