import { useState, useMemo, useCallback } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, Clock, ChevronRight, Pencil, Save, CheckCircle2 } from "lucide-react";
import type { CalibrationGasInventoryItem } from "@/types/calibrationGas";
import { toast } from "sonner";
import { calcFirstEntry, calcCompletion, isWithin60Days } from "@/lib/inspectionCycleLogic";
import InspectionCompleteDialog from "@/components/InspectionCompleteDialog";

const EDITABLE_FIELDS: (keyof CalibrationGasInventoryItem)[] = [
  "gas_inspection_first", "gas_inspection_last", "gas_inspection_next",
  "gas_inspection_round", "gas_inspection_so", "gas_inspection_so_arrival",
  "velocity_inspection_first", "velocity_inspection_last", "velocity_inspection_next",
  "velocity_inspection_round", "velocity_inspection_so",
  "inspection_notes", "inspection_date", "inspection_cycle",
  "md", "monthly_amount", "contract_consumables", "notes",
];

type CompletionTarget = { itemId: string; type: "gas" | "velocity" } | null;

export default function CalibrationGasInventory() {
  const { inventory, updateInventoryItem } = useCalGas();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState<"all" | "expiry" | "low">("all");
  const [editMode, setEditMode] = useState(false);
  const [editBuffer, setEditBuffer] = useState<Record<string, Partial<CalibrationGasInventoryItem>>>({});
  const [completionTarget, setCompletionTarget] = useState<CompletionTarget>(null);

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

  /* ── Shared styles ── */
  const thBase = "whitespace-nowrap font-bold text-foreground bg-primary/10 border-r border-b border-border/50 py-2 px-2 text-center text-[11px]";
  const td = "text-[11px] border-r border-border/30 py-1.5 px-2 align-middle";
  const pinkBg = "bg-pink-100 dark:bg-pink-950/40";

  /** Render a plain or editable cell (no rowspan) */
  const renderCell = (item: CalibrationGasInventoryItem, field: keyof CalibrationGasInventoryItem, extraClass = "") => {
    const isEditable = editMode && EDITABLE_FIELDS.includes(field);
    const val = getCellValue(item, field);
    if (isEditable) {
      return (
        <td className={`${td} ${extraClass} p-0.5`}>
          <input
            className="w-full h-full bg-accent/30 border border-primary/30 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={val}
            onChange={(e) => handleCellChange(item.id, field, e.target.value)}
          />
        </td>
      );
    }
    return <td className={`${td} ${extraClass}`}>{val || ""}</td>;
  };

  /** Render a merged (rowspan) editable/read-only cell — only rendered when span > 0 */
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
            className="w-full h-full bg-accent/30 border border-primary/30 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50"
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
          <table className="min-w-[3600px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
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
                <th colSpan={7} className={`${thBase} bg-blue-500/10`}>가스상 정도검사</th>
                <th colSpan={6} className={`${thBase} bg-green-500/10`}>유속계 정도검사</th>
                <th rowSpan={2} className={`${thBase} min-w-[140px]`}>비고사항</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>점검일</th>
                <th rowSpan={2} className={`${thBase} min-w-[70px]`}>점검주기</th>
                <th rowSpan={2} className={`${thBase} min-w-[60px]`}>M/D</th>
                <th rowSpan={2} className={`${thBase} min-w-[80px]`}>월 금액</th>
                <th rowSpan={2} className={`${thBase} min-w-[90px]`}>소모품포함</th>
                <th rowSpan={2} className={`${thBase} min-w-[120px] border-r-0`}>비고</th>
              </tr>
              <tr className="bg-primary/5">
                <th className={`${thBase} min-w-[80px]`}>농도</th>
                <th className={`${thBase} min-w-[60px]`}>용량(L)</th>
                <th className={`${thBase} min-w-[80px]`}>유효기간</th>
                <th className={`${thBase} min-w-[60px]`}>잔량</th>
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-blue-500/10`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-blue-500/10`}>차수</th>
                <th className={`${thBase} min-w-[40px] bg-blue-500/10`}>완료</th>
                <th className={`${thBase} min-w-[80px] bg-blue-500/10`}>S/O발행</th>
                <th className={`${thBase} min-w-[90px] bg-blue-500/10`}>S/O도착</th>
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>최초</th>
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>최종</th>
                <th className={`${thBase} min-w-[70px] bg-green-500/10`}>예정</th>
                <th className={`${thBase} min-w-[50px] bg-green-500/10`}>차수</th>
                <th className={`${thBase} min-w-[40px] bg-green-500/10`}>완료</th>
                <th className={`${thBase} min-w-[80px] bg-green-500/10`}>S/O발행</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const expSoon = isExpirySoon(item.expiry_date);
                const lowRem = isLowRemaining(item.remaining_percent);
                const s = rowSpanData[idx]; // { site, tms, unit }
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

                return (
                  <tr key={item.id} className={`${rowBg} hover:bg-accent/40 transition-colors border-b border-border/20`}>
                    {/* ── Site-level merged (A, B) ── */}
                    {s.site > 0 && (
                      <td rowSpan={s.site} className={`${td} text-center bg-muted/20 font-medium whitespace-nowrap`}>
                        {item.contract_end_date || "-"}
                      </td>
                    )}
                    {s.site > 0 && (
                      <td rowSpan={s.site} className={`${td} font-semibold whitespace-nowrap ${anyInspDue ? pinkBg : "bg-muted/30"}`}>
                        {item.site_name}
                        {anyInspDue && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">검사예정</Badge>}
                      </td>
                    )}

                    {/* ── TMS-level merged (C) ── */}
                    {s.tms > 0 && (
                      <td rowSpan={s.tms} className={`${td} text-center`}>
                        <Badge variant={item.tms_status === "전송" ? "default" : "secondary"} className="text-[10px] px-1.5">
                          {item.tms_status}
                        </Badge>
                      </td>
                    )}

                    {/* ── Unit-level merged (D, J~M, N~X inspection, Y~AE management) ── */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} text-center font-medium`}>
                        {item.unit_no}
                      </td>
                    )}

                    {/* ── Per-gas-row columns (E~I): NOT merged ── */}
                    <td className={`${td} whitespace-nowrap`}>{item.analyzer_range}</td>
                    <td className={`${td} text-center`}>{item.concentration}</td>
                    <td className={`${td} text-center`}>{item.volume_L}</td>
                    <td className={`${td} text-center whitespace-nowrap`}>
                      <span className={expSoon ? "text-destructive font-medium" : ""}>{item.expiry_date || "-"}</span>
                      {expSoon && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">임박</Badge>}
                    </td>
                    <td className={`${td} text-center`}>
                      <span className={lowRem ? "text-destructive font-medium" : ""}>{item.remaining_percent}</span>
                      {lowRem && <Badge variant="destructive" className="ml-1 text-[9px] px-1 py-0">부족</Badge>}
                    </td>

                    {/* ── Unit-level merged: J구매주체, K S/O, L 도착, M 지점 ── */}
                    {s.unit > 0 && <td rowSpan={s.unit} className={`${td} text-center`}>{item.purchase_entity}</td>}
                    {s.unit > 0 && <td rowSpan={s.unit} className={`${td} text-center whitespace-nowrap`}>{item.so_issue}</td>}
                    {s.unit > 0 && <td rowSpan={s.unit} className={`${td} text-center whitespace-nowrap`}>{item.arrival_status}</td>}
                    {s.unit > 0 && <td rowSpan={s.unit} className={`${td} text-center`}>{item.branch}</td>}

                    {/* ── Unit-level merged: N~S 가스상 정도검사 ── */}
                    {renderMergedCell(item, "gas_inspection_first", s.unit, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_last", s.unit, "text-center whitespace-nowrap")}
                    {/* P: 예정 - pink if within 60 days */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} text-center whitespace-nowrap ${gasDue ? pinkBg + " font-semibold text-destructive" : ""}`}>
                        {editMode ? (
                          <input
                            className="w-full bg-accent/30 border border-primary/30 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    {renderMergedCell(item, "gas_inspection_round", s.unit, "text-center")}
                    {/* 완료 button */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} text-center`}>
                        {item.gas_inspection_first && (
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "gas" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3" /> 완료
                          </button>
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "gas_inspection_so", s.unit, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "gas_inspection_so_arrival", s.unit, "text-center whitespace-nowrap")}

                    {/* ── Unit-level merged: T~X 유속계 정도검사 ── */}
                    {renderMergedCell(item, "velocity_inspection_first", s.unit, "text-center whitespace-nowrap")}
                    {renderMergedCell(item, "velocity_inspection_last", s.unit, "text-center whitespace-nowrap")}
                    {/* V: 예정 - pink if within 60 days */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} text-center whitespace-nowrap ${velDue ? pinkBg + " font-semibold text-destructive" : ""}`}>
                        {editMode ? (
                          <input
                            className="w-full bg-accent/30 border border-primary/30 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    {renderMergedCell(item, "velocity_inspection_round", s.unit, "text-center")}
                    {/* 완료 button */}
                    {s.unit > 0 && (
                      <td rowSpan={s.unit} className={`${td} text-center`}>
                        {item.velocity_inspection_first && (
                          <button
                            onClick={() => setCompletionTarget({ itemId: item.id, type: "velocity" })}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20 transition-colors border border-green-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3" /> 완료
                          </button>
                        )}
                      </td>
                    )}
                    {renderMergedCell(item, "velocity_inspection_so", s.unit, "text-center whitespace-nowrap")}

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
    </div>
  );
}
