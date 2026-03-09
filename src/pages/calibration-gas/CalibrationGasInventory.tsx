import { useState, useMemo } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertTriangle, Clock } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">교정가스 현황표</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사업장, 호기, 가스명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[180px]">
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
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${alertFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            전체
          </button>
          <button
            onClick={() => setAlertFilter("expiry")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${alertFilter === "expiry" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            <Clock className="h-3 w-3" /> 유효기간 임박
          </button>
          <button
            onClick={() => setAlertFilter("low")}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${alertFilter === "low" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            <AlertTriangle className="h-3 w-3" /> 잔량 부족
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">총 {filtered.length}건</div>

      <ScrollArea className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="whitespace-nowrap min-w-[120px]">사업장명</TableHead>
                <TableHead className="whitespace-nowrap">TMS</TableHead>
                <TableHead className="whitespace-nowrap">호기</TableHead>
                <TableHead className="whitespace-nowrap">교정가스</TableHead>
                <TableHead className="whitespace-nowrap">농도</TableHead>
                <TableHead className="whitespace-nowrap">용량(L)</TableHead>
                <TableHead className="whitespace-nowrap">유효기간</TableHead>
                <TableHead className="whitespace-nowrap">잔량</TableHead>
                <TableHead className="whitespace-nowrap">구매주체</TableHead>
                <TableHead className="whitespace-nowrap">지점</TableHead>
                <TableHead className="whitespace-nowrap">점검주기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const expSoon = isExpirySoon(item.expiry_date);
                const lowRem = isLowRemaining(item.remaining_percent);
                return (
                  <TableRow
                    key={item.id}
                    className={`${expSoon || lowRem ? "bg-destructive/5 border-l-2 border-l-destructive" : ""}`}
                  >
                    <TableCell className="font-medium text-xs whitespace-nowrap">{item.site_name}</TableCell>
                    <TableCell className="text-xs">{item.tms_status}</TableCell>
                    <TableCell className="text-xs">{item.unit_no}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{item.gas_name}</TableCell>
                    <TableCell className="text-xs">{item.concentration}</TableCell>
                    <TableCell className="text-xs">{item.volume_L}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {item.expiry_date || "-"}
                      {expSoon && <Badge variant="destructive" className="ml-1 text-[10px] px-1">임박</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.remaining_percent}
                      {lowRem && <Badge variant="destructive" className="ml-1 text-[10px] px-1">부족</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{item.purchase_entity}</TableCell>
                    <TableCell className="text-xs">{item.branch}</TableCell>
                    <TableCell className="text-xs">{item.inspection_cycle}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
