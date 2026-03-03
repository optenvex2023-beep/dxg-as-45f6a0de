import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import NotificationBell from "@/components/NotificationBell";
import { useApp } from "@/contexts/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Layout() {
  const { users, currentUser, setCurrentUser } = useApp();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b flex items-center justify-end px-4 gap-3 bg-background shrink-0">
          <NotificationBell />
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">사용자 전환:</span>
          <Select
            value={currentUser?.id ?? ""}
            onValueChange={(id) => {
              const u = users.find((u) => u.id === id);
              setCurrentUser(u ?? null);
            }}
          >
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="사용자 선택" />
            </SelectTrigger>
            <SelectContent>
              {users.filter(u => u.is_active).map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.name} ({u.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
