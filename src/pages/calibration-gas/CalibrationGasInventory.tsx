import { useState, useMemo, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, Clock, ChevronRight, Pencil, Save } from "lucide-react";
import type { CalibrationGasInventoryItem } from "@/types/calibrationGas";
import { toast } from "sonner";

/** Editable field keys (N~Y columns + Z~AE management columns + notes) */
const EDITABLE_FIELDS: (keyof CalibrationGasInventoryItem)[] = [
  "gas_inspection_first", "gas_inspection_last", "gas_inspection_next",
  "gas_inspection_round", "gas_inspection_so", "gas_inspection_so_arrival",
  "velocity_inspection_first", "velocity_inspection_last", "velocity_inspection_next",
  "velocity_inspection_round", "velocity_inspection_so",
  "inspection_notes", "inspection_date", "inspection_cycle",
  "md", "monthly_amount", "contract_consumables", "notes",
];

export default function CalibrationGasInventory() {
  const { inventory, updateInventoryItem } = useCalGas();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState<"all" | "expiry" | "low">("all");
  const [editMode, setEditMode] = useState(false);
  const [editBuffer, setEditBuffer] = useState<Record<string, Partial<CalibrationGasInventoryItem>>>({});

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
    const spans: { site: number; tms: number; unit: number }[] = [];
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

      spans.push({ site: siteSpan, tms: tmsSpan, unit: unitSpan });
    }
    return spans;
  }, [filtered]);

  /* ── Edit handlers ── */
  const handleStartEdit = useCallback(() => {
    setEditBuffer({});
    setEditMode(true);
  }, []);

  const handleSave = useCallback(() => {
    let count = 0;
    for (const [id, updates] of Object.entries(editBuffer)) {
      if (Object.keys(updates).length > 0) {
        updateInventoryItem(id, updates);
        count++;
      }
    }
    setEditMode(false);
    setEditBuffer({});
    toast.success(`${count}건의 항목이 저장되었습니다.`);
  }, [editBuffer, updateInventoryItem]);

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

  /* ── Shared cell classes ── */
  const thBase = "whitespace-nowrap font-bold text-foreground bg-primary/10 border-r border-b border-border/50 py-2 px-2 text-center text-[11px]";
  const tdBase = "text-[11px] border-r border-border/30 py-1.5 px-2 align-middle";

  const renderCell = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem, extraClass = "") => {
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    if (isEditable) {
      return (
        <td className={`${tdBase} ${extraClass} p-0.5`}>
          <input
            className="w-full h-full bg-accent/30 border border-primary/30 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={val}
            onChange={(e) => handleCellChange(item.id, field, e.target.value)}
          />
        </td>
      );
    }
    return <td className={`${tdBase} ${extraClass}`}>{val || ""}</td>;
  };

  return (
    <div className="space-y-4">
      {/* Title + Action Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">교정가스 현황표</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{filtered.length}</span>건
          </span>
          {!editMode ? (
            <Button size="sm" onClick={handleStartEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> 등록
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> 저장
            </Button>
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
        <div className="flex gap-1">
          {([ ["all", "전체", null], ["expiry", "유효기간 임박", Clock], ["low", "잔량 부족", AlertTriangle] ] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setAlertFilter(key as any)}
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
          <table className="min-w-[3200px] w-full border-collapse text-sm">
            {/* ── Multi-row header ── */}
            <thead className="sticky top-0 z-10">
              {/* Row 1: Group headers */}
              <tr className="bg-primary/10">
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>계약종료일</th>
                <th rowSpan={2} className={`${thBase} min-w-[120px]`}>사업장명</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>TMS</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>호기</th>
                <th rowSpan={2} className={`${thBase} min-w-[100px]`}>분석기 Range</th>
                <th colSpan={2} className={`${thBase}`}>교정가스</th>
                <th colSpan={2} className={`${thBase}`}>사업장 보유 가스</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>구매주체</th>
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>S/O 발행</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>도착예정</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>지점</th>
                <th colSpan={6} className={`${thBase} bg-blue-500/10`}>가스상 정도검사</th>
                <th colSpan={5} className={`${thBase} bg-green-500/10`}>유속계 정도검사</th>
                <th rowSpan={2} className={`${thBase} min-w-[140px]`}>비고사항</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>점검일</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>점검주기</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>M/D</th>
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>월 금액</th>
                <th rowSpan={2} className={`${thBase} min-w-[90px]`}>소모품포함</th>
                <th rowSpan={2} className={`${thBase} min-w-[120px] border-r-0`}>비고</th>
              </tr>
              {/* Row 2: Sub headers */}
              <tr className="bg-primary/5">
                <th className={`${thBase} min-w-[80px]`}>농도</th>
                <th className={`${thBase} min-w-[60px]`}>용량(L)</th>
                <th className={`${thBase} min-w-[80px]`}>유효기간</th>
                <th className={`${thBase} min-w-[60px]`}>잔량</th>
                {/* 가스상 정도검사 sub */}
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-blue-500/10`}>차수</th>
                <th className={`${thBase} min-w-[80px] bg-blue-500/10`}>S/O발행</th>
                <th className={`${thBase} min-w-[90px] bg-blue-500/10`}>S/O도착</th>
                {/* 유속계 정도검사 sub */}
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-green-500/10`}>차수</th>
                <th className={`${thBase} min-w-[80px] bg-green-500/10`}>S/O발행</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const expSoon = isExpirySoon(item.expiry_date);
                const lowRem = isLowRemaining(item.remaining_percent);
                const spanData = rowSpanData[idx];
                const isEvenGroup = (() => {
                  let g = 0;
                  for (let i = 0; i <= idx; i++) { if (rowSpanData[i].site > 0) g++; }
                  return g % 2 === 0;
                })();

                const rowBg = expSoon || lowRem
                  ? "bg-destructive/5"
                  : isEvenGroup ? "bg-muted/20" : "bg-background";

                return (
                  <tr key={item.id} className={`${rowBg} hover:bg-accent/40 transition-colors border-b border-border/20`}>
                    {/* A: 계약종료일 - merged with site */}
                    {spanData.site > 0 && (
                      <td rowSpan={spanData.site} className={`${tdBase} text-center bg-muted/20 font-medium whitespace-nowrap`}>
                        {item.contract_end_date || "-"}
                      </td>
                    )}
                    {/* B: 사업장명 */}
                    {spanData.site > 0 && (
                      <td rowSpan={spanData.site} className={`${tdBase} font-semibold whitespace-nowrap bg-muted/30`}>
                        {item.site_name}
                      </td>
                    )}
                    {/* C: TMS */}
                    {spanData.tms > 0 && (
                      <td rowSpan={spanData.tms} className={`${tdBase} text-center`}>
                        <Badge variant={item.tms_status === "전송" ? "default" : "secondary"} className="text-[10px] px-1.5">
                          {item.tms_status}
                        </Badge>
                      </td>
                    )}
                    {/* D: 호기 */}
                    {spanData.unit > 0 && (
                      <td rowSpan={spanData.unit} className={`${tdBase} text-center font-medium`}>
                        {item.unit_no}
                      </td>
                    )}
                    {/* E: 분석기 Range */}
                    <td className={`${tdBase} whitespace-nowrap`}>{item.analyzer_range}</td>
                    {/* F: 농도 */}
                    <td className={`${tdBase} text-center`}>{item.concentration}</td>
                    {/* G: 용량 */}
                    <td className={`${tdBase} text-center`}>{item.volume_L}</td>
                    {/* H: 유효기간 */}
                    <td className={`${tdBase} text-center whitespace-nowrap`}>
                      <span className={expSoon ? "text-destructive font-medium" : ""}>{item.expiry_date || "-"}</span>
                      {expSoon && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                    </td>
                    {/* I: 잔량 */}
                    <td className={`${tdBase} text-center`}>
                      <span className={lowRem ? "text-destructive font-medium" : ""}>{item.remaining_percent}</span>
                      {lowRem && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">부족</Badge>}
                    </td>
                    {/* J: 구매주체 */}
                    <td className={`${tdBase} text-center`}>{item.purchase_entity}</td>
                    {/* K: S/O 발행 */}
                    <td className={`${tdBase} text-center whitespace-nowrap`}>{item.so_issue}</td>
                    {/* L: 도착예정 */}
                    <td className={`${tdBase} text-center whitespace-nowrap`}>{item.arrival_status}</td>
                    {/* M: 지점 */}
                    <td className={`${tdBase} text-center`}>{item.branch}</td>
                    {/* N~S: 가스상 정도검사 */}
                    {renderCell(item, "gas_inspection_first", "text-center whitespace-nowrap")}
                    {renderCell(item, "gas_inspection_last", "text-center whitespace-nowrap")}
                    {renderCell(item, "gas_inspection_next", "text-center whitespace-nowrap")}
                    {renderCell(item, "gas_inspection_round", "text-center")}
                    {renderCell(item, "gas_inspection_so", "text-center whitespace-nowrap")}
                    {renderCell(item, "gas_inspection_so_arrival", "text-center whitespace-nowrap")}
                    {/* T~X: 유속계 정도검사 */}
                    {renderCell(item, "velocity_inspection_first", "text-center whitespace-nowrap")}
                    {renderCell(item, "velocity_inspection_last", "text-center whitespace-nowrap")}
                    {renderCell(item, "velocity_inspection_next", "text-center whitespace-nowrap")}
                    {renderCell(item, "velocity_inspection_round", "text-center")}
                    {renderCell(item, "velocity_inspection_so", "text-center whitespace-nowrap")}
                    {/* Y: 비고사항 */}
                    {renderCell(item, "inspection_notes", "max-w-[200px] truncate")}
                    {/* Z: 점검일 */}
                    {renderCell(item, "inspection_date", "text-center")}
                    {/* AA: 점검주기 */}
                    {renderCell(item, "inspection_cycle", "text-center whitespace-nowrap")}
                    {/* AB: M/D */}
                    {renderCell(item, "md", "text-center")}
                    {/* AC: 월 금액 */}
                    {renderCell(item, "monthly_amount", "text-center whitespace-nowrap")}
                    {/* AD: 소모품 포함 */}
                    {renderCell(item, "contract_consumables", "text-center")}
                    {/* AE: 비고 */}
                    {renderCell(item, "notes", "border-r-0 max-w-[160px] truncate")}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
