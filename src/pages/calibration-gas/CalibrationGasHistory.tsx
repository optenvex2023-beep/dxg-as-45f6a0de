import { useState, useMemo } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, History } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  "현황표 수정": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "현황표 신규등록": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "가스상 정도검사 완료": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "유속계 정도검사 완료": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

export default function CalibrationGasHistory() {
  const { history, inventory } = useCalGas();
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const items = [...history].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((h) => {
      const inv = inventory.find((i) => i.id === h.inventory_item_id);
      const haystack = `${inv?.site_name || ""} ${inv?.unit_no || ""} ${inv?.gas_name || ""} ${h.file_name} ${h.field_name} ${h.updated_by}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [history, search, inventory]);

  const getInventoryInfo = (id: string) => {
    const inv = inventory.find((i) => i.id === id);
    if (!inv) return { site: "-", unit: "-", range: "-" };
    return { site: inv.site_name, unit: inv.unit_no, range: inv.analyzer_range || "-" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">이력관리</h2>
        <span className="text-sm text-muted-foreground ml-2">총 {sorted.length}건</span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="사업장, 호기, 작업자, 작업유형 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {sorted.length === 0 && (
        <div className="text-center text-muted-foreground py-12 text-sm">
          변경 이력이 없습니다.
        </div>
      )}

      {sorted.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">작업일시</TableHead>
                <TableHead className="text-xs">작업자</TableHead>
                <TableHead className="text-xs">작업유형</TableHead>
                <TableHead className="text-xs">사업장명</TableHead>
                <TableHead className="text-xs">호기</TableHead>
                <TableHead className="text-xs">분석기 Range</TableHead>
                <TableHead className="text-xs">변경항목</TableHead>
                <TableHead className="text-xs">변경 전</TableHead>
                <TableHead className="text-xs">변경 후</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((h) => {
                const info = getInventoryInfo(h.inventory_item_id);
                const actionColor = ACTION_COLORS[h.file_name] || "bg-muted text-muted-foreground";
                return (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(h.updated_at).toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{h.updated_by}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className={`text-[10px] ${actionColor} border-0`}>
                        {h.file_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{info.site}</TableCell>
                    <TableCell className="text-xs">{info.unit}</TableCell>
                    <TableCell className="text-xs">{info.range}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">{h.field_name}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.before_value || "-"}</TableCell>
                    <TableCell className="text-xs font-medium">{h.after_value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
