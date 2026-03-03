import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const { inAppNotifications, currentUser, markNotificationRead } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const myNotifications = inAppNotifications
    .filter((n) => n.recipient_user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = myNotifications.filter((n) => !n.read_at).length;
  const preview = myNotifications.slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = (noti: typeof myNotifications[0]) => {
    if (!noti.read_at) markNotificationRead(noti.id);
    setOpen(false);
    if (noti.link_url) navigate(noti.link_url);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
        aria-label="알림"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[400px] overflow-y-auto rounded-lg border bg-popover shadow-lg z-[60]">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-semibold">알림</span>
            <button
              onClick={() => { setOpen(false); navigate("/notifications"); }}
              className="text-xs text-primary hover:underline"
            >
              전체보기
            </button>
          </div>
          {preview.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">알림이 없습니다.</div>
          )}
          {preview.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
                !n.read_at && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                <span className="text-xs font-medium truncate">{n.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</p>
              <span className="text-[10px] text-muted-foreground">
                {formatRelative(n.created_at)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
