import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationCenter() {
  const { inAppNotifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const myNotifications = inAppNotifications
    .filter((n) => n.recipient_user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = tab === "unread" ? myNotifications.filter((n) => !n.read_at) : myNotifications;
  const unreadCount = myNotifications.filter((n) => !n.read_at).length;

  const handleClick = (noti: typeof myNotifications[0]) => {
    if (!noti.read_at) {
      markNotificationRead(noti.id);
    }
    if (noti.link_url) {
      navigate(noti.link_url);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" /> 알림센터
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" /> 모두 읽음 처리
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("all")}
        >
          전체 ({myNotifications.length})
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "unread" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("unread")}
        >
          미확인 ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            {tab === "unread" ? "읽지 않은 알림이 없습니다." : "알림이 없습니다."}
          </div>
        )}
        {filtered.map((noti) => (
          <button
            key={noti.id}
            onClick={() => handleClick(noti)}
            className={cn(
              "w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50",
              !noti.read_at && "bg-primary/5 border-primary/20"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {!noti.read_at && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{noti.title}</span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">{noti.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                {formatRelative(noti.created_at)}
              </span>
            </div>
          </button>
        ))}
      </div>
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
