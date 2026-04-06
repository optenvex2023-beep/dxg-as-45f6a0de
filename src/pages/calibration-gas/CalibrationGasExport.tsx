import { useState } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { exportCalGasWithTemplate } from "@/lib/calGasTemplateExport";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function CalibrationGasExport() {
  const { inventory } = useCalGas();
  const [isExporting, setIsExporting] = useState(false);

  /** 양식 출력: 마스터 템플릿 기반 엑셀 다운로드 */
  const handleTemplateExport = async () => {
    if (inventory.length === 0) {
      toast.error("다운로드할 데이터가 없습니다.");
      return;
    }
    setIsExporting(true);
    try {
      await exportCalGasWithTemplate(inventory);
      toast.success("양식 엑셀이 다운로드되었습니다.");
    } catch (err) {
      console.error("Template export error:", err);
      toast.error("엑셀 다운로드에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  /** 단순 export: 현재 데이터를 간단한 표로 다운로드 */
  const handleSimpleExport = () => {
    const rows = inventory.map((item) => ({
      "유지보수 계약 종료일": item.contract_end_date || "",
      "사업장명": item.site_name,
      "TMS 전송 유무": item.tms_status,
      "호기": item.unit_no,
      "교정가스": item.gas_name,
      "농도(ppm,%)": item.concentration,
      "용량(L)": item.volume_L,
      "유효기간": item.expiry_date || "",
      "잔량": item.remaining_percent,
      "구매 주체": item.purchase_entity,
      "S/O 발행": item.so_issue,
      "도착예정": item.arrival_status,
      "지점": item.branch,
      "점검일": item.inspection_date,
      "점검주기": item.inspection_cycle,
      "M/D": item.md,
      "월 금액": item.monthly_amount,
      "비고": item.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 18 }, { wch: 22 }, { wch: 8 }, { wch: 12 },
      { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
      { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
      { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 },
      { wch: 12 }, { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "교정가스 현황");
    XLSX.writeFile(wb, `교정가스_현황_단순_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">엑셀 다운로드</h2>

      {/* 양식 출력 (Template-based) */}
      <div className="border rounded-lg p-6 text-center space-y-4">
        <FileSpreadsheet className="h-12 w-12 text-primary mx-auto" />
        <div>
          <p className="text-sm font-medium">양식 엑셀 다운로드 (마스터 양식 기반)</p>
          <p className="text-xs text-muted-foreground mt-1">
            원본 양식(병합셀·서식·헤더)을 유지한 상태로 현재 데이터가 반영됩니다.
          </p>
          <p className="text-xs text-muted-foreground">
            총 {inventory.length}개 항목 포함
          </p>
        </div>
        <Button onClick={handleTemplateExport} size="lg" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? "생성 중..." : "양식 엑셀 다운로드"}
        </Button>
      </div>

      {/* 단순 Export */}
      <div className="border rounded-lg p-4 text-center space-y-3 bg-muted/30">
        <div>
          <p className="text-sm font-medium text-muted-foreground">단순 데이터 다운로드</p>
          <p className="text-xs text-muted-foreground mt-1">
            서식 없이 현재 데이터를 단순 표 형태로 다운로드합니다.
          </p>
        </div>
        <Button onClick={handleSimpleExport} variant="outline" size="sm">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          단순 엑셀 다운로드
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• <strong>양식 엑셀</strong>: 원본 마스터 양식과 동일한 구조 (병합셀, 다단 헤더, 서식 유지)</p>
        <p>• <strong>단순 엑셀</strong>: 데이터만 포함된 간단한 표 형태</p>
        <p>• 최신 데이터가 반영된 시점의 현황이 다운로드됩니다.</p>
      </div>
    </div>
  );
}
