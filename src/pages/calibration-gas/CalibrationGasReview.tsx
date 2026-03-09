import { useCalGas } from "@/contexts/CalibrationGasContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle, Search } from "lucide-react";

export default function CalibrationGasReview() {
  const { extractions, approveExtraction, rejectExtraction, updateExtractionField, updateExtractionItem, inventory, setExtractionMatchedIds } = useCalGas();
  const { currentUser } = useApp();

  const pending = extractions.filter((e) => e.status === "pending");
  const completed = extractions.filter((e) => e.status !== "pending");

  const handleApprove = (id: string) => {
    approveExtraction(id, currentUser?.name || "시스템");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "matched": return <Badge className="bg-primary/10 text-primary text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />매칭 완료</Badge>;
      case "review_needed": return <Badge variant="outline" className="border-accent text-accent text-xs"><AlertTriangle className="h-3 w-3 mr-1" />검토 필요</Badge>;
      case "match_failed": return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />매칭 실패</Badge>;
      default: return null;
    }
  };

  const inventoryOptions = inventory.map((inv) => ({
    id: inv.id,
    label: `${inv.site_name} - ${inv.unit_no} - ${inv.gas_name}`,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">업데이트 검토</h2>

      {pending.length === 0 && completed.length === 0 && (
        <div className="text-center text-muted-foreground py-12 text-sm">
          검토 대기 중인 항목이 없습니다.
        </div>
      )}

      {/* Pending extractions */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">검토 대기 ({pending.length}건)</h3>
          {pending.map((ext) => (
            <div key={ext.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ext.file_name}</span>
                  {statusBadge(ext.match_status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(ext.created_at).toLocaleString("ko-KR")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">감지된 사업장</label>
                  <Input
                    value={ext.detected_site}
                    onChange={(e) => updateExtractionField(ext.id, "detected_site", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">감지된 호기</label>
                  <Input
                    value={ext.detected_unit}
                    onChange={(e) => updateExtractionField(ext.id, "detected_unit", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Extraction items */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">가스명</TableHead>
                    <TableHead className="text-xs">추출된 잔량</TableHead>
                    <TableHead className="text-xs">추출된 유효기간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ext.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">
                        <Input
                          value={item.gas_name}
                          onChange={(e) => updateExtractionItem(ext.id, idx, { gas_name: e.target.value })}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        <Input
                          value={item.remaining_percent}
                          onChange={(e) => updateExtractionItem(ext.id, idx, { remaining_percent: e.target.value })}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        <Input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => updateExtractionItem(ext.id, idx, { expiry_date: e.target.value })}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Manual match override for failed/review_needed */}
              {(ext.match_status === "match_failed" || ext.match_status === "review_needed") && (
                <div className="bg-muted/30 p-3 rounded">
                  <label className="text-xs font-medium mb-1 block">수동 매칭: 대상 재고 선택</label>
                  <Select
                    onValueChange={(val) => setExtractionMatchedIds(ext.id, [val])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="재고 항목 선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => rejectExtraction(ext.id)}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> 거부
                </Button>
                <Button size="sm" onClick={() => handleApprove(ext.id)} disabled={ext.match_status === "match_failed" && ext.matched_inventory_ids.length === 0}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 적용
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">처리 완료 ({completed.length}건)</h3>
          {completed.map((ext) => (
            <div key={ext.id} className="flex items-center justify-between border rounded-lg p-3 opacity-70">
              <div className="flex items-center gap-2">
                <span className="text-sm">{ext.file_name}</span>
                <span className="text-xs text-muted-foreground">{ext.detected_site} / {ext.detected_unit}</span>
              </div>
              <Badge variant={ext.status === "approved" ? "default" : "destructive"} className="text-xs">
                {ext.status === "approved" ? "적용됨" : "거부됨"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
