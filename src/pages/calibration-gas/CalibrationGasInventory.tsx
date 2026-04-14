import { useState, useMemo, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, Clock, ChevronRight, Pencil, Save, CheckCircle2, X, Plus, Gauge, Zap } from "lucide-react";
import type { CalibrationGasInventoryItem } from "@/types/calibrationGas";
import { toast } from "sonner";
import { calcFirstEntry, calcCompletion, isWithin60Days, isDueOrPast } from "@/lib/inspectionCycleLogic";
import InspectionCompleteDialog from "@/components/InspectionCompleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const EDITABLE_FIELDS: (keyof CalibrationGasInventoryItem)[] = [
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
type AlertFilterType = "all" | "expiry" | "low" | "gas_insp" | "vel_insp";

const NEW_ROW_FIELDS: { key: keyof CalibrationGasInventoryItem; label: string; required?: boolean }[] = [
  { key: "site_name", label: "사업장명", required: true },
  { key: "tms_status", label: "TMS 전송유무" },
  { key: "unit_no", label: "호기", required: true },
  { key: "analyzer_range", label: "분석기 Range" },
  { key: "gas_name", label: "가스명", required: true },
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

  const { inventory, updateInventoryItem, addInventoryItem } = useCalGas();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState<AlertFilterType>("all");
  const [editMode, setEditMode] = useState(false);
  const [editBuffer, setEditBuffer] = useState<Record<string, Partial<CalibrationGasInventoryItem>>>({});
  const [completionTarget, setCompletionTarget] = useState<CompletionTarget>(null);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [newRow, setNewRow] = useState<CalibrationGasInventoryItem>(createEmptyItem);

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

      const gasSpan = calcGroupSpan(i, (it) => it.gas_inspection_merge_group ?? 0);
      const velSpan = calcGroupSpan(i, (it) => it.velocity_inspection_merge_group ?? 0);
      const purchase = calcGroupSpan(i, (it) => it.purchase_entity_merge_group ?? 0);
      const branch = calcGroupSpan(i, (it) => it.branch_merge_group ?? 0);

      spans.push({ site: siteSpan, tms: tmsSpan, unit: unitSpan, gas: gasSpan, vel: velSpan, purchase, branch });
    }
    return spans;
  }, [filtered]);

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
    for (const [id, updates] of Object.entries(editBuffer)) {
      if (Object.keys(updates).length > 0) {
        if (updates.gas_inspection_first) {
          const item = inventory.find((i) => i.id === id);
          if (item && !item.gas_inspection_last && !updates.gas_inspection_last) {
            const auto = calcFirstEntry(updates.gas_inspection_first);
            updates.gas_inspection_next = auto.next;
            updates.gas_inspection_round = auto.round;
          }
        }
        if (updates.velocity_inspection_first) {
          const item = inventory.find((i) => i.id === id);
          if (item && !item.velocity_inspection_last && !updates.velocity_inspection_last) {
            const auto = calcFirstEntry(updates.velocity_inspection_first);
            updates.velocity_inspection_next = auto.next;
            updates.velocity_inspection_round = auto.round;
          }
        }
        updateInventoryItem(id, updates);
        count++;
      }
    }
    setEditMode(false);
    setEditBuffer({});
    toast.success(`${count}건의 항목이 저장되었습니다.`);
  }, [editBuffer, updateInventoryItem, inventory]);

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

    if (type === "gas") {
      const currentRound = item.gas_inspection_round || "1차";
      const result = calcCompletion(dateStr, currentRound);
      updateInventoryItem(itemId, {
        gas_inspection_last: result.last,
        gas_inspection_next: result.next,
        gas_inspection_round: result.round,
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
      toast.success(`유속계 정도검사 완료: 다음 예정일 ${result.next} (${result.round})`);
    }
    setCompletionTarget(null);
  }, [completionTarget, inventory, updateInventoryItem]);

  /* ── Add row handler ── */
  const handleAddRow = useCallback(() => {
    if (!newRow.site_name.trim() || !newRow.unit_no.trim() || !newRow.gas_name.trim()) {
      toast.error("사업장명, 호기, 가스명은 필수입니다.");
      return;
    }
    addInventoryItem({ ...newRow, id: crypto.randomUUID() });
    setNewRow(createEmptyItem());
    setAddRowOpen(false);
    toast.success("새 항목이 추가되었습니다.");
  }, [newRow, addInventoryItem]);

  /* ── Shared styles ── */
  const thBase = "whitespace-nowrap font-bold text-table-header-foreground bg-table-header border-r border-b border-white/20 py-2 px-2 text-center text-[11px]";
  const td = "text-[11px] border-r border-border/30 py-1.5 px-2 align-middle group-hover:bg-accent/40";
  const pinkBg = "bg-pink-100 dark:bg-pink-950/40";
  const greenBg = "bg-lime-200 dark:bg-lime-900/50";

  /* ── Sticky column styles (left-pinned) ── */
  const stickyTh = "sticky z-30 bg-table-header border-r border-border";
  const stickyTd = "sticky z-10 bg-background border-r border-border outline-none ring-0 shadow-none";
  // Cumulative left offsets: 계약종료일(80) + 사업장명(90) + TMS(60) + 호기(70) + Range(100)
  const stickyCol = [
    { left: "left-0", w: "w-[80px] min-w-[80px] max-w-[80px]" },        // 계약종료일
    { left: "left-[80px]", w: "w-[90px] min-w-[90px] max-w-[90px]" },    // 사업장명 (1.5× of 60)
    { left: "left-[170px]", w: "w-[60px] min-w-[60px] max-w-[60px]" },   // TMS
    { left: "left-[230px]", w: "w-[70px] min-w-[70px] max-w-[70px]" },   // 호기
    { left: "left-[300px]", w: "w-[100px] min-w-[100px] max-w-[100px]" }, // 분석기 Range
  ] as const;
  const stickyBorderRight = "border-r-2 border-r-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]";

  /** Render a plain or editable cell (no rowspan) */
  const renderCell = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem, extraClass = "") => {
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    if (isEditable) {
      return (
        <td className={`${td} ${extraClass} p-0.5`}>
          <input
            className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            value={val}
            onChange={(e) => handleCellChange(item.id, field, e.target.value)}
          />
        </td>
      );
    }
    return <td className={`${td} ${extraClass}`}>{val || ""}</td>;
  };

  /** Render a merged (rowspan) editable/read-only cell */
  const renderMergedCell = (
    item: CalibrationGasInventoryItem,
    field: keyof CalibrationGasInventoryItem,
    span: number,
    extraClass = ""
  ) => {
    if (span === 0) return null;
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    if (isEditable) {
      return (
        <td rowSpan={span} className={`${td} ${extraClass} p-0.5`}>
          <input
            className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            value={val}
            onChange={(e) => handleCellChange(item.id, field, e.target.value)}
          />
        </td>
      );
    }
    return <td rowSpan={span} className={`${td} ${extraClass}`}>{val || ""}</td>;
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
          <Button size="sm" variant="outline" onClick={() => setAddRowOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> 행 추가
          </Button>
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
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-background shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]" style={{ scrollbarGutter: "stable" }}>
          <table className="min-w-[3600px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
              <tr className="bg-table-header">
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[0].left} ${stickyCol[0].w}`}>계약종료일</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[1].left} ${stickyCol[1].w} overflow-hidden text-ellipsis`}>사업장명</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[2].left} ${stickyCol[2].w}`}>TMS</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[3].left} ${stickyCol[3].w}`}>호기</th>
                <th rowSpan={2} className={`${thBase} ${stickyTh} ${stickyCol[4].left} ${stickyCol[4].w} ${stickyBorderRight}`}>분석기 Range</th>
                <th colSpan={2} className={`${thBase}`}>교정가스</th>
                <th colSpan={2} className={`${thBase}`}>사업장 보유 가스</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>구매주체</th>
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>S/O 발행</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>도착예정</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>지점</th>
                <th colSpan={7} className={`${thBase} bg-table-header-gas`}>가스상 정도검사</th>
                <th colSpan={6} className={`${thBase} bg-table-header-velocity`}>유속계 정도검사</th>
                <th rowSpan={2} className={`${thBase} min-w-[140px]`}>비고사항</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>점검일</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>점검주기</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>M/D</th>
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>월 금액</th>
                <th rowSpan={2} className={`${thBase} min-w-[90px]`}>소모품포함</th>
                <th rowSpan={2} className={`${thBase} min-w-[120px] border-r-0`}>비고</th>
              </tr>
              <tr className="bg-table-header">
                <th className={`${thBase} min-w-[80px]`}>농도</th>
                <th className={`${thBase} min-w-[60px]`}>용량(L)</th>
                <th className={`${thBase} min-w-[80px]`}>유효기간</th>
                <th className={`${thBase} min-w-[60px]`}>잔량</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-gas`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-gas`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-gas`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-table-header-gas`}>차수</th>
                <th className={`${thBase} min-w-[60px] bg-table-header-gas`}>예정/완료</th>
                <th className={`${thBase} min-w-[80px] bg-table-header-gas`}>S/O발행</th>
                <th className={`${thBase} min-w-[90px] bg-table-header-gas`}>S/O도착</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-velocity`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-velocity`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-table-header-velocity`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-table-header-velocity`}>차수</th>
                <th className={`${thBase} min-w-[60px] bg-table-header-velocity`}>예정/완료</th>
                <th className={`${thBase} min-w-[80px] bg-table-header-velocity`}>S/O발행</th>
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

                return (
                  <tr key={item.id} className={`group ${rowBg} transition-colors ${isSiteStart ? "border-t-2 border-t-[rgb(128,128,128)]" : "border-b border-border/20"}`}>
                    {/* ── Site-level merged (A, B) ── */}
                    {s.site > 0 && (
                      <td rowSpan={s.site} className={`${td} ${stickyTd} ${stickyCol[0].left} ${stickyCol[0].w} text-center font-medium whitespace-nowrap ${
                        (() => {
                          if (!item.contract_end_date) return "!bg-muted";
                          const d = new Date(item.contract_end_date);
                          if (isNaN(d.getTime())) return "!bg-muted";
                          return d <= sixtyDaysLater ? "!bg-orange-100 dark:!bg-orange-950" : "!bg-muted";
                        })()
                      }`}>
                        {item.contract_end_date || "-"}
                      </td>
                    )}
                    {s.site > 0 && (
                      <td rowSpan={s.site} className={`${td} ${stickyTd} ${stickyCol[1].left} ${stickyCol[1].w} font-semibold whitespace-normal break-keep ${anyInspDue ? "!bg-pink-100 dark:!bg-pink-950" : "!bg-muted"}`}>
                        <span className="block leading-tight">{item.site_name}</span>
                        {anyInspDue && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">검사예정</Badge>}
                      </td>
                    )}

                    {/* ── TMS-level merged (C) ── */}
                    {s.tms > 0 && (
                      <td rowSpan={s.tms} className={`${td} ${stickyTd} ${stickyCol[2].left} ${stickyCol[2].w} text-center !bg-background`}>
                        <Badge variant={item.tms_status === "전송" ? "default" : "secondary"} className="text-[10px] px-1.5">
                          {item.tms_status}
                        </Badge>
                      </td>
                    )}

                    {/* ── Unit-level merged (D) ── */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} ${stickyTd} ${stickyCol[3].left} ${stickyCol[3].w} text-center font-medium !bg-background`}>
                        {item.unit_no}
                      </td>
                    )}

                    {/* ── Per-gas-row columns (E): 분석기 Range ── */}
                    <td className={`${td} ${stickyTd} ${stickyCol[4].left} ${stickyCol[4].w} ${stickyBorderRight} whitespace-nowrap group-hover:!bg-accent/40 overflow-hidden text-ellipsis`}>
                      <span className="truncate block">{item.analyzer_range}</span>
                    </td>
                    {renderCell(item, "concentration", "text-center")}
                    {renderCell(item, "volume_L", "text-center")}
                    {/* Expiry date */}
                    {editMode && EDITABLE_FIELDS.includes("expiry_date") ? (
                      <td className={`${td} text-center whitespace-nowrap p-0.5`}>
                        <input
                          className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          value={getCellValue(item, "expiry_date")}
                          onChange={(e) => handleCellChange(item.id, "expiry_date", e.target.value)}
                        />
                      </td>
                    ) : (
                      <td className={`${td} text-center whitespace-nowrap`}>
                        <span className={expSoon ? "text-destructive font-medium" : ""}>{item.expiry_date || "-"}</span>
                        {expSoon && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                      </td>
                    )}
                    {/* Remaining percent */}
                    {editMode && EDITABLE_FIELDS.includes("remaining_percent") ? (
                      <td className={`${td} text-center p-0.5`}>
                        <input
                          className="w-full h-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 rounded px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          value={getCellValue(item, "remaining_percent")}
                          onChange={(e) => handleCellChange(item.id, "remaining_percent", e.target.value)}
                        />
                      </td>
                    ) : (
                      <td className={`${td} text-center`}>
                        <span className={lowRem ? "text-destructive font-medium" : ""}>{item.remaining_percent}</span>
                        {lowRem && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">부족</Badge>}
                      </td>
                    )}

                    {/* ── Unit-level merged: J구매주체, M 지점 ── */}
                    {renderMergedCell(item, "purchase_entity", s.purchase, "text-center")}
                    {/* ── K S/O, L 도착: 개별 셀 (병합 안 함) ── */}
                    {renderCell(item, "so_issue", "text-center whitespace-nowrap")}
                    {renderCell(item, "arrival_status", "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "branch", s.branch, "text-center")}

                    {/* ── Gas inspection merge group: N~S 가스상 정도검사 ── */}
                    {renderMergedCell(item, "gas_inspection_first", s.gas, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_last", s.gas, "text-center whitespace-nowrap")}
                    {/* P: 예정 - pink if within 60 days */}
                    {s.gas > 0 && (
                      <td rowSpan={s.gas} className={`${td} text-center whitespace-nowrap ${gasInspDueOrPast(item) ? greenBg + " font-semibold" : ""}`}>
                        {editMode ? (
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
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "gas_inspection_round", s.gas, "text-center")}
                    {/* 예정/완료 column */}
                    {s.gas > 0 && (
                      <td rowSpan={s.gas} className={`${td} text-center`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">예정</span>
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "gas" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> 완료 체크
                          </button>
                        </div>
                      </td>
                    )}
                    {renderMergedCell(item, "gas_inspection_so", s.gas, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_so_arrival", s.gas, "text-center whitespace-nowrap")}

                    {/* ── Velocity inspection merge group: T~X 유속계 정도검사 ── */}
                    {renderMergedCell(item, "velocity_inspection_first", s.vel, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "velocity_inspection_last", s.vel, "text-center whitespace-nowrap")}
                    {/* V: 예정 - pink if within 60 days */}
                    {s.vel > 0 && (
                      <td rowSpan={s.vel} className={`${td} text-center whitespace-nowrap ${velInspDueOrPast(item) ? greenBg + " font-semibold" : ""}`}>
                        {editMode ? (
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
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "velocity_inspection_round", s.vel, "text-center")}
                    {/* 예정/완료 column */}
                    {s.vel > 0 && (
                      <td rowSpan={s.vel} className={`${td} text-center`}>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">예정</span>
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "velocity" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20 transition-colors border border-green-500/20"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> 완료 체크
                          </button>
                        </div>
                      </td>
                    )}
                    {renderMergedCell(item, "velocity_inspection_so", s.vel, "text-center whitespace-nowrap")}

                    {/* ── Unit-level merged: Y~AE ── */}
                    {renderMergedCell(item, "inspection_notes", s.unit, "max-w-[200px] truncate")}
                    {renderMergedCell(item, "inspection_date", s.unit, "text-center")}
                    {renderMergedCell(item, "inspection_cycle", s.unit, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "md", s.unit, "text-center")}
                    {renderMergedCell(item, "monthly_amount", s.unit, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "contract_consumables", s.unit, "text-center")}
                    {renderMergedCell(item, "notes", s.unit, "border-r-0 max-w-[160px] truncate")}
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
    </div>
  );
}
