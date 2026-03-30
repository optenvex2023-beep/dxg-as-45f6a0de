import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isEmpty, isInProgress, isExcludedFromDue7 } from "@/lib/inspectionFilters";
interface KpiCard {
  label: string;
  count: number;
  filterKey: string;
  filterValue: string;
}

export default function Dashboard() {
  const { inspections } = useApp();
  const navigate = useNavigate();

  const countByStatus = (s: string) => inspections.filter((i) => i.status === s).length;

  const inspInProgressCount = inspections.filter(isInProgress).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueWarning7Count = inspections.filter((i) => {
    if (!i.contract_due_date) return false;
    if (isExcludedFromDue7(i)) return false;
    const due = new Date(i.contract_due_date);
    due.setHours(0, 0, 0, 0);
    const warn = new Date(due);
    warn.setDate(warn.getDate() - 7);
    return today >= warn && today <= due;
  }).length;

  const cards: KpiCard[] = [
    { label: "확인필요", count: countByStatus("확인필요"), filterKey: "status", filterValue: "확인필요" },
    { label: "반출예정", count: countByStatus("반출예정"), filterKey: "status", filterValue: "반출예정" },
    { label: "반출완료", count: countByStatus("반출완료"), filterKey: "status", filterValue: "반출완료" },
    { label: "점검중", count: inspInProgressCount, filterKey: "filter", filterValue: "점검중" },
    { label: "재설치대기", count: countByStatus("최종 점검완료"), filterKey: "status", filterValue: "최종 점검완료" },
    { label: "계약납기 7일전", count: dueWarning7Count, filterKey: "due", filterValue: "7days" },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => {
              navigate(`/status-table?${card.filterKey}=${encodeURIComponent(card.filterValue)}`);
            }}
            className={cn(
              "rounded-lg border bg-card p-4 text-left shadow-sm hover:shadow-md transition-shadow",
              card.label === "계약납기 7일전" && card.count > 0 && "border-l-4 border-l-accent"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.count}<span className="text-sm font-normal ml-1">건</span></p>
          </button>
        ))}
      </div>

      {inspections.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>등록된 반출점검 데이터가 없습니다.</p>
          <p className="text-sm mt-1">현황표에서 새 레코드를 추가해주세요.</p>
        </div>
      )}
    </div>
  );
}