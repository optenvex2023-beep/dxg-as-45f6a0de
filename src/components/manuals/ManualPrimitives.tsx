import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight } from "lucide-react";

/** 둥근 프레임으로 실제 화면을 시뮬레이션 */
export function MockScreen({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/40">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        {title && (
          <span className="ml-2 text-xs text-muted-foreground truncate">
            {title}
          </span>
        )}
      </div>
      <div className="p-3 bg-background">{children}</div>
    </div>
  );
}

/** 빨간 원형 클릭 포인트 표시기 */
export function ClickPoint({
  label,
  className,
}: {
  label?: string | number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold ring-2 ring-destructive/30 shadow",
        className
      )}
    >
      {label ?? ""}
    </span>
  );
}

/** 화살표로 연결된 단계별 흐름 */
export function StepFlow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1 text-xs">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {i + 1}
            </span>
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** 앱 버튼 미니 스타일 */
export function MockButton({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  className?: string;
}) {
  const styles: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    outline: "border bg-background text-foreground",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** 빨간 테두리 필독 안내 박스 */
export function NoticeBox({
  title = "필독 안내",
  items,
}: {
  title?: string;
  items: React.ReactNode[];
}) {
  return (
    <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-sm font-bold text-destructive">{title}</h3>
      </div>
      <ul className="list-disc pl-6 space-y-1 text-sm text-foreground">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/** 섹션 카드 — 인쇄 시 분리 방지 */
export function SectionCard({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="manual-section rounded-lg border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-3 border-b pb-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {num}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

/** 일반 강조 박스 */
export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    tone === "warning"
      ? "border-yellow-500/40 bg-yellow-500/10"
      : "border-primary/30 bg-primary/5";
  return (
    <div className={cn("rounded-md border-l-4 px-3 py-2 text-sm", styles)}>
      {children}
    </div>
  );
}

/** "확인 필요" 인라인 배지 */
export function NeedsConfirm({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/15 border border-yellow-500/40 px-1.5 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-300 align-middle">
      🔍 확인 필요{children ? <>: {children}</> : null}
    </span>
  );
}

/** 인쇄용 글로벌 스타일 — 한 번만 렌더 */
export function ManualPrintStyles() {
  return (
    <style>{`
      @media print {
        /* 화면 전용 영역 숨김
           ⚠️ 전역 'header' 셀렉터를 사용하면 SectionCard 내부의 <header>(번호+제목)까지
           숨겨지므로, Layout 상단 바와 사이드바/네비게이션만 정확히 타겟팅한다. */
        aside, nav, .no-print { display: none !important; }
        body > div > div > header,
        #root > div > div > header { display: none !important; }

        /* 매뉴얼 카드 내부 헤더(번호 + 제목)는 반드시 출력되도록 강제 */
        .manual-section > header,
        .manual-section header {
          display: flex !important;
          visibility: visible !important;
        }

        /* 페이지/배경 초기화 */
        html, body { background: white !important; height: auto !important; overflow: visible !important; }

        /* 모든 부모 스크롤 컨테이너를 풀어 전체 본문이 출력되도록 */
        body * { overflow: visible !important; }
        html, body, #root, #root > div, main, .manual-page,
        .manual-page * {
          max-height: none !important;
          height: auto !important;
        }
        main { padding: 0 !important; display: block !important; }

        /* 스크롤바 숨김 (WebKit) */
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }

        /* 매뉴얼 페이지 컨테이너 */
        .manual-page { padding: 0 !important; max-width: none !important; margin: 0 !important; }

        /* 섹션 카드: 중간 분리 방지 */
        .manual-section {
          break-inside: avoid;
          page-break-inside: avoid;
          box-shadow: none !important;
        }
        /* 섹션 헤더(번호 + 제목)는 본문과 함께 유지 */
        .manual-section > header {
          break-after: avoid-page;
          page-break-after: avoid;
        }
        /* 표지는 단독 페이지 */
        .manual-cover { break-after: page; page-break-after: always; }

        /* 제목 직후 고아 줄 방지 */
        h1, h2, h3, h4 {
          break-after: avoid-page;
          page-break-after: avoid;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* 카드/박스/안내영역도 가능한 한 분리 방지 */
        .rounded-lg, .rounded-xl, .rounded-md {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* 이미지는 페이지 폭을 넘지 않도록 */
        img { max-width: 100% !important; height: auto !important; break-inside: avoid; page-break-inside: avoid; }

        /* 색상/배경 충실 출력 */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

        @page { size: A4 portrait; margin: 12mm; }
      }
    `}</style>
  );
}
