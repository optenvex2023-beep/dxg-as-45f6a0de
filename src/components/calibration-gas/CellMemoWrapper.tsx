import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MessageSquarePlus, Pencil } from "lucide-react";

interface CellMemoWrapperProps {
  hasMemo: boolean;
  onOpenMemo: () => void;
  children: ReactNode;
}

/**
 * Wraps a table cell's INNER content with:
 *  - a right-click context menu offering "메모 삽입/수정"
 *  - a small red corner indicator if a memo exists
 *
 * IMPORTANT: this component renders a relative <div> inside the existing <td>,
 * so it never touches rowSpan, sticky positioning, conditional bg colors,
 * or any other table-cell layout logic.
 */
export function CellMemoWrapper({ hasMemo, onOpenMemo, children }: CellMemoWrapperProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative w-full h-full">
          {children}
          {hasMemo && (
            <span
              aria-label="메모 있음"
              title="메모 있음 (우클릭하여 보기/수정)"
              className="pointer-events-none absolute -top-0.5 -right-0.5 w-0 h-0 border-t-[6px] border-l-[6px] border-t-red-500 border-l-transparent"
            />
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem onSelect={onOpenMemo} className="gap-2 text-xs">
          {hasMemo ? (
            <>
              <Pencil className="h-3.5 w-3.5" /> 메모 수정
            </>
          ) : (
            <>
              <MessageSquarePlus className="h-3.5 w-3.5" /> 메모 삽입
            </>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
