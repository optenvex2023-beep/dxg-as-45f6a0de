import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CellMemoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (memo: string) => Promise<void> | void;
  initialMemo: string;
  cellLabel: string;
}

export function CellMemoDialog({
  open,
  onClose,
  onSave,
  initialMemo,
  cellLabel,
}: CellMemoDialogProps) {
  const [memo, setMemo] = useState(initialMemo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setMemo(initialMemo);
  }, [open, initialMemo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(memo);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">셀 메모</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <p className="text-xs text-muted-foreground">{cellLabel}</p>
          <Textarea
            autoFocus
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모 내용을 입력하세요..."
            className="min-h-[120px] text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            * 내용을 비우고 저장하면 메모가 삭제됩니다.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
