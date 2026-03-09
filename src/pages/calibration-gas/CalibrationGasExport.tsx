import { useCalGas } from "@/contexts/CalibrationGasContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function CalibrationGasExport() {
  const { inventory } = useCalGas();

  const handleExport = () => {
    // Build rows matching original Excel structure
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

    // Column widths
    ws["!cols"] = [
      { wch: 18 }, { wch: 22 }, { wch: 8 }, { wch: 12 },
      { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
      { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
      { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 },
      { wch: 12 }, { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "교정가스 현황");
    XLSX.writeFile(wb, `교정가스_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">엑셀 다운로드</h2>

      <div className="border rounded-lg p-6 text-center space-y-4">
        <Download className="h-12 w-12 text-primary mx-auto" />
        <div>
          <p className="text-sm font-medium">현재 교정가스 현황표를 엑셀로 다운로드</p>
          <p className="text-xs text-muted-foreground mt-1">
            총 {inventory.length}개 항목이 포함됩니다.
          </p>
        </div>
        <Button onClick={handleExport} size="lg">
          <Download className="h-4 w-4 mr-2" />
          엑셀 다운로드
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• 엑셀 파일은 원본 양식과 동일한 컬럼 구조로 생성됩니다.</p>
        <p>• 최신 데이터가 반영된 시점의 현황이 다운로드됩니다.</p>
      </div>
    </div>
  );
}
