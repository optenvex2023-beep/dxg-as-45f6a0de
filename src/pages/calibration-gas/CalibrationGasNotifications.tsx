import { useState } from "react";
import { useCalGas } from "@/contexts/CalibrationGasContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, AlertTriangle, Clock, XCircle, Search as SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { CalibrationGasNotification } from "@/types/calibrationGas";

export default function CalibrationGasNotifications() {
  const { notifications, markCalGasNotificationRead, markAllCalGasNotificationsRead } = useCalGas();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<CalibrationGasNotification | null>(null);

  const sorted = [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filtered = tab === "unread" ? sorted.filter((n) => !n.read_at) : sorted;
  const unreadCount = sorted.filter((n) => !n.read_at).length;

  const handleClick = (noti: CalibrationGasNotification) => {
    if (!noti.read_at) markCalGasNotificationRead(noti.id);
    setSelected(noti);
  };

  const handleNavigate = (url: string) => {
    setSelected(null);
    navigate(url);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "expiry_soon": return <Clock className="h-4 w-4 text-destructive" />;
      case "low_remaining": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "match_failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "review_needed": return <SearchIcon className="h-4 w-4 text-accent" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" /> 교정가스 알림센터
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllCalGasNotificationsRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <CheckCheck className="h-3.5 w-3.5" /> 모두 읽음
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        <button
          className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          onClick={() => setTab("all")}
        >
          전체 ({sorted.length})
        </button>
        <button
          className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", tab === "unread" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          onClick={() => setTab("unread")}
        >
          미확인 ({unreadCount})
        </button>
      </div>

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
            <div className="flex items-start gap-2">
              {typeIcon(noti.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {!noti.read_at && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <span className="text-sm font-medium truncate">{noti.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{noti.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                {formatRelative(noti.created_at)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base leading-snug">{selected?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed py-1">{selected?.body}</p>
          </ScrollArea>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">{selected ? formatRelative(selected.created_at) : ""}</span>
            {selected?.link_url && (
              <Button size="sm" onClick={() => handleNavigate(selected.link_url!)}>바로가기</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
