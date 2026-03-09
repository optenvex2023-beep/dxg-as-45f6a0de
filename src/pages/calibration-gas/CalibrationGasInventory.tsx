import { useState, useMemo } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, Clock, ChevronRight } from "lucide-react";

export default function CalibrationGasInventory() {
  const { inventory } = useCalGas();
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState<"all" | "expiry" | "low">("all");

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

  // Calculate rowspans for merged cell display
  const rowSpanData = useMemo(() => {
    const spans: { site: number; tms: number; unit: number }[] = [];
    
    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i];
      
      // Calculate site_name rowspan
      let siteSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== current.site_name) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === current.site_name; j++) {
          siteSpan++;
        }
      } else {
        siteSpan = 0; // Will be merged with previous
      }

      // Calculate TMS rowspan (within same site)
      let tmsSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== current.site_name || filtered[i - 1].tms_status !== current.tms_status) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === current.site_name && filtered[j].tms_status === current.tms_status; j++) {
          tmsSpan++;
        }
      } else {
        tmsSpan = 0;
      }

      // Calculate unit_no rowspan (within same site and TMS)
      let unitSpan = 1;
      if (i === 0 || filtered[i - 1].site_name !== current.site_name || filtered[i - 1].tms_status !== current.tms_status || filtered[i - 1].unit_no !== current.unit_no) {
        for (let j = i + 1; j < filtered.length && filtered[j].site_name === current.site_name && filtered[j].tms_status === current.tms_status && filtered[j].unit_no === current.unit_no; j++) {
          unitSpan++;
        }
      } else {
        unitSpan = 0;
      }

      spans.push({ site: siteSpan, tms: tmsSpan, unit: unitSpan });
    }
    
    return spans;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">교정가스 현황표</h2>
        <div className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filtered.length}</span>건
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/30 rounded-lg border">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사업장, 호기, 가스명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="사업장 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 사업장</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <button
            onClick={() => setAlertFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${alertFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground hover:bg-muted"}`}
          >
            전체
          </button>
          <button
            onClick={() => setAlertFilter("expiry")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${alertFilter === "expiry" ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground hover:bg-muted"}`}
          >
            <Clock className="h-3 w-3" /> 유효기간 임박
          </button>
          <button
            onClick={() => setAlertFilter("low")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${alertFilter === "low" ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground hover:bg-muted"}`}
          >
            <AlertTriangle className="h-3 w-3" /> 잔량 부족
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronRight className="h-3 w-3" />
        <span>테이블을 좌우로 스크롤하여 모든 컬럼을 확인하세요</span>
      </div>

      {/* Table Container with proper scrolling */}
      <div className="border rounded-lg bg-background shadow-sm">
        <div 
          className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]"
          style={{ scrollbarGutter: 'stable' }}
        >
          <Table className="min-w-[1400px]">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                <TableHead className="whitespace-nowrap min-w-[140px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3">사업장명</TableHead>
                <TableHead className="whitespace-nowrap min-w-[80px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">TMS</TableHead>
                <TableHead className="whitespace-nowrap min-w-[70px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">호기</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3">교정가스</TableHead>
                <TableHead className="whitespace-nowrap min-w-[100px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">농도</TableHead>
                <TableHead className="whitespace-nowrap min-w-[80px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">용량(L)</TableHead>
                <TableHead className="whitespace-nowrap min-w-[120px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">유효기간</TableHead>
                <TableHead className="whitespace-nowrap min-w-[90px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">잔량</TableHead>
                <TableHead className="whitespace-nowrap min-w-[100px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">구매주체</TableHead>
                <TableHead className="whitespace-nowrap min-w-[80px] font-bold text-foreground bg-primary/10 border-r border-border/50 py-3 text-center">지점</TableHead>
                <TableHead className="whitespace-nowrap min-w-[90px] font-bold text-foreground bg-primary/10 py-3 text-center">점검주기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => {
                const expSoon = isExpirySoon(item.expiry_date);
                const lowRem = isLowRemaining(item.remaining_percent);
                const spanData = rowSpanData[idx];
                const isEvenGroup = (() => {
                  // Determine group index for alternating background
                  let groupIdx = 0;
                  for (let i = 0; i <= idx; i++) {
                    if (rowSpanData[i].site > 0) groupIdx++;
                  }
                  return groupIdx % 2 === 0;
                })();

                return (
                  <TableRow
                    key={item.id}
                    className={`
                      ${isEvenGroup ? "bg-muted/20" : "bg-background"}
                      ${expSoon || lowRem ? "!bg-destructive/10" : ""}
                      hover:bg-accent/50 transition-colors
                      border-b border-border/30
                    `}
                  >
                    {/* 사업장명 - merged cell */}
                    {spanData.site > 0 && (
                      <TableCell 
                        rowSpan={spanData.site}
                        className="font-semibold text-sm whitespace-nowrap border-r border-border/50 py-2.5 px-3 align-middle bg-muted/30"
                      >
                        {item.site_name}
                      </TableCell>
                    )}
                    
                    {/* TMS - merged cell */}
                    {spanData.tms > 0 && (
                      <TableCell 
                        rowSpan={spanData.tms}
                        className="text-sm text-center border-r border-border/50 py-2.5 px-3 align-middle"
                      >
                        <Badge variant={item.tms_status === "전송" ? "default" : "secondary"} className="text-xs">
                          {item.tms_status}
                        </Badge>
                      </TableCell>
                    )}
                    
                    {/* 호기 - merged cell */}
                    {spanData.unit > 0 && (
                      <TableCell 
                        rowSpan={spanData.unit}
                        className="text-sm text-center font-medium border-r border-border/50 py-2.5 px-3 align-middle"
                      >
                        {item.unit_no}
                      </TableCell>
                    )}

                    {/* Regular cells */}
                    <TableCell className="text-sm whitespace-nowrap border-r border-border/50 py-2.5 px-3">{item.gas_name}</TableCell>
                    <TableCell className="text-sm text-center border-r border-border/50 py-2.5 px-3">{item.concentration}</TableCell>
                    <TableCell className="text-sm text-center border-r border-border/50 py-2.5 px-3">{item.volume_L}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-center border-r border-border/50 py-2.5 px-3">
                      <span className={expSoon ? "text-destructive font-medium" : ""}>
                        {item.expiry_date || "-"}
                      </span>
                      {expSoon && <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">임박</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-center border-r border-border/50 py-2.5 px-3">
                      <span className={lowRem ? "text-destructive font-medium" : ""}>
                        {item.remaining_percent}
                      </span>
                      {lowRem && <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">부족</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-center border-r border-border/50 py-2.5 px-3">{item.purchase_entity}</TableCell>
                    <TableCell className="text-sm text-center border-r border-border/50 py-2.5 px-3">{item.branch}</TableCell>
                    <TableCell className="text-sm text-center py-2.5 px-3">{item.inspection_cycle}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
