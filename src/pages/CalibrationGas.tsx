import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Database, Upload, ClipboardCheck, History, Bell, Download } from "lucide-react";

const subNavItems = [
  { label: "현황표", path: "/calibration-gas/inventory", icon: <Database className="h-4 w-4" /> },
  { label: "점검보고서 업로드", path: "/calibration-gas/upload", icon: <Upload className="h-4 w-4" /> },
  { label: "업데이트 검토", path: "/calibration-gas/review", icon: <ClipboardCheck className="h-4 w-4" /> },
  { label: "이력관리", path: "/calibration-gas/history", icon: <History className="h-4 w-4" /> },
  { label: "알림센터", path: "/calibration-gas/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "엑셀 다운로드", path: "/calibration-gas/export", icon: <Download className="h-4 w-4" /> },
];

export default function CalibrationGas() {
  const location = useLocation();

  // Redirect bare /calibration-gas to /calibration-gas/inventory
  if (location.pathname === "/calibration-gas") {
    return <Navigate to="/calibration-gas/inventory" replace />;
  }

  return (
    <div>
      {/* Sub-navigation tabs */}
      <div className="flex gap-1 border-b mb-4 overflow-x-auto">
        {subNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
