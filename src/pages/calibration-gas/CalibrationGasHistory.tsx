import { useState, useMemo } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, History } from "lucide-react";

export default function CalibrationGasHistory() {
  const { history, inventory } = useCalGas();
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const items = [...history].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((h) => {
      const inv = inventory.find((i) => i.id === h.inventory_item_id);
      const haystack = `${inv?.site_name || ""} ${inv?.unit_no || ""} ${inv?.gas_name || ""} ${h.file_name}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [history, search, inventory]);

  const getInventoryLabel = (id: string) => {
    const inv = inventory.find((i) => i.id === id);
    return inv ? `${inv.site_name} / ${inv.unit_no} / ${inv.gas_name}` : id;
  };

  const fieldLabel = (field: string) => {
    switch (field) {
      case "remaining_percent": return "잔량(%)";
      case "expiry_date": return "유효기간";
      default: return field;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">이력관리</h2>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                <TableHead className="text-xs">일시</TableHead>
                <TableHead className="text-xs">대상 재고</TableHead>
                <TableHead className="text-xs">파일명</TableHead>
                <TableHead className="text-xs">항목</TableHead>
                <TableHead className="text-xs">변경 전</TableHead>
                <TableHead className="text-xs">변경 후</TableHead>
                <TableHead className="text-xs">처리자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(h.updated_at).toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-xs">{getInventoryLabel(h.inventory_item_id)}</TableCell>
                  <TableCell className="text-xs">{h.file_name}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">{fieldLabel(h.field_name)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.before_value || "-"}</TableCell>
                  <TableCell className="text-xs font-medium">{h.after_value}</TableCell>
                  <TableCell className="text-xs">{h.updated_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
