import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ClipboardCheck,
  FlaskConical,
  Users,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  Database,
  Upload,
  History,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { isSuperAdmin } from "@/lib/permissions";
import { toast } from "sonner";


interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    label: "반출점검",
    icon: <ClipboardCheck className="h-4 w-4" />,
    children: [
      { label: "대시보드", path: "/dashboard" },
      { label: "현황표", path: "/status-table" },
      { label: "1차 점검보고서", path: "/first-report" },
      { label: "완료 점검보고서", path: "/final-report" },
      { label: "알림센터", path: "/notifications" },
    ],
  },
  {
    label: "교정가스",
    icon: <FlaskConical className="h-4 w-4" />,
    children: [
      { label: "현황표", path: "/calibration-gas/inventory" },
      { label: "이력관리", path: "/calibration-gas/history" },
      { label: "알림센터", path: "/calibration-gas/notifications" },
      { label: "엑셀 다운로드", path: "/calibration-gas/export" },
    ],
  },
  {
    label: "담당자관리",
    path: "/user-management",
    icon: <Users className="h-4 w-4" />,
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const { currentUser, refetchAll } = useApp();
  const { refetchAll: refetchCalGas } = useCalGas();
  const superAdmin = isSuperAdmin(currentUser);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "반출점검": true, "교정가스": true });
  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path || location.pathname.startsWith(c.path + "/")) ?? false;

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight truncate">
            반출점검·교정가스 관리
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              if (refreshing) return;
              setRefreshing(true);
              try {
                // 데이터 재조회: 브라우저 reload/세션 초기화 없이 컨텍스트의 fetch 함수만 재호출
                await Promise.all([refetchAll(), refetchCalGas()]);
                toast.success("데이터를 새로고침했습니다.");
              } catch {
                toast.error("새로고침에 실패했습니다.");
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            className="p-1 rounded hover:bg-sidebar-accent/30 text-sidebar-foreground disabled:opacity-50"
            title="새로고침"
            aria-label="새로고침"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-sidebar-accent/30 text-sidebar-foreground"
            title={collapsed ? "메뉴 열기" : "메뉴 닫기"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 관리자 패널 / 관리자 모드 라벨 (super admin 전용 — 표시용) */}
      {superAdmin && !collapsed && (
        <div className="px-3 pt-2 pb-2 space-y-1.5">
          <div className="text-[11px] text-sidebar-foreground/70">관리자 패널</div>
          <span className="inline-flex items-center rounded-md border border-yellow-400 px-2 py-0.5 text-[11px] font-medium text-yellow-300 bg-transparent">
            관리자 모드
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          if (item.children) {
            const expanded = expandedGroups[item.label] ?? false;
            const groupActive = isGroupActive(item);
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm gap-2 hover:bg-sidebar-accent/20 transition-colors",
                    groupActive && "bg-sidebar-accent/30 text-sidebar-primary-foreground"
                  )}
                >
                  {item.icon}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {expanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && expanded && (
                  <div className="ml-4 border-l border-sidebar-border">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center px-4 py-1.5 text-sm hover:bg-sidebar-accent/20 transition-colors",
                          (isActive(child.path) || location.pathname.startsWith(child.path)) &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={cn(
                "flex items-center px-3 py-2 text-sm gap-2 hover:bg-sidebar-accent/20 transition-colors",
                isActive(item.path!) &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Build version footer */}
      <div className="border-t border-sidebar-border px-3 py-2">
        {(() => {
          const d = new Date(__BUILD_TIME__);
          const pad = (n: number) => n.toString().padStart(2, "0");
          const label = `v${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          return (
            <span
              className="text-[10px] text-sidebar-foreground/60 font-mono truncate block"
              title={`Build ${label}`}
            >
              {collapsed ? label.slice(1, 11) : label}
            </span>
          );
        })()}
      </div>
    </aside>
  );
}
