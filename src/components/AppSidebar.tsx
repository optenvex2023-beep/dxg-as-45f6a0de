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
  Database,
  Upload,
  History,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    ],
  },
  {
    label: "교정가스",
    icon: <FlaskConical className="h-4 w-4" />,
    children: [
      { label: "현황표", path: "/calibration-gas/inventory" },
      { label: "보고서 업로드", path: "/calibration-gas/upload" },
      { label: "업데이트 검토", path: "/calibration-gas/review" },
      { label: "이력관리", path: "/calibration-gas/history" },
      { label: "알림센터", path: "/calibration-gas/notifications" },
      { label: "엑셀 다운로드", path: "/calibration-gas/export" },
    ],
  },
  {
    label: "알림센터",
    path: "/notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: "담당자관리",
    path: "/user-management",
    icon: <Users className="h-4 w-4" />,
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "반출점검": true, "교정가스": true });
  const [collapsed, setCollapsed] = useState(false);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path || location.pathname.startsWith(c.path + "/")) ?? false;

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 min-h-screen",
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
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent/30 text-sidebar-foreground"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

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
    </aside>
  );
}
