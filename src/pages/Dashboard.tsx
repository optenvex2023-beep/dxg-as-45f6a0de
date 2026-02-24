import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface KpiCard {
  label: string;
  count: number;
  filter?: string;
}

export default function Dashboard() {
  const { inspections } = useApp();
  const navigate = useNavigate();

  const total = inspections.length;
  const countByStatus = (s: string) => inspections.filter((i) => i.status === s).length;
  const dueWarningCount = inspections.filter((i) => i.due_warning || i.status === "납기유의").length;

  const cards: KpiCard[] = [
    { label: "등록 현장", count: total },
    { label: "확인필요", count: countByStatus("확인필요"), filter: "확인필요" },
    { label: "반출예정", count: countByStatus("반출예정"), filter: "반출예정" },
    { label: "입고완료", count: countByStatus("입고완료"), filter: "입고완료" },
    { label: "재설치 대기", count: countByStatus("최종 점검완료"), filter: "최종 점검완료" },
    { label: "납기유의", count: dueWarningCount, filter: "납기유의" },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => {
              if (card.filter) {
                navigate(`/status-table?status=${encodeURIComponent(card.filter)}`);
              } else {
                navigate("/status-table");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 text-left shadow-sm hover:shadow-md transition-shadow",
              card.label === "납기유의" && card.count > 0 && "border-l-4 border-l-accent"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.count}</p>
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
