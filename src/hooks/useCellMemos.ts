import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CellMemo {
  id: string;
  inventory_item_id: string;
  column_key: string;
  memo: string;
  updated_at: string;
  updated_by: string;
}

const memoKey = (rowId: string, colKey: string) => `${rowId}::${colKey}`;

/**
 * Hook for per-cell memos on the Calibration Gas inventory grid.
 * Stored in `calibration_gas_cell_memos` — completely separate from inventory rows.
 */
export function useCellMemos() {
  const [memos, setMemos] = useState<Record<string, CellMemo>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("calibration_gas_cell_memos")
      .select("*");
    if (error) {
      console.error("Failed to load cell memos:", error);
      setLoading(false);
      return;
    }
    const map: Record<string, CellMemo> = {};
    (data ?? []).forEach((m: CellMemo) => {
      map[memoKey(m.inventory_item_id, m.column_key)] = m;
    });
    setMemos(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const getMemo = useCallback(
    (rowId: string, colKey: string): CellMemo | undefined =>
      memos[memoKey(rowId, colKey)],
    [memos],
  );

  const saveMemo = useCallback(
    async (rowId: string, colKey: string, memo: string, userName: string) => {
      const trimmed = memo.trim();
      const existing = memos[memoKey(rowId, colKey)];

      // Empty memo → delete
      if (!trimmed) {
        if (existing) {
          const { error } = await supabase
            .from("calibration_gas_cell_memos")
            .delete()
            .eq("id", existing.id);
          if (error) throw error;
          setMemos((prev) => {
            const next = { ...prev };
            delete next[memoKey(rowId, colKey)];
            return next;
          });
        }
        return;
      }

      if (existing) {
        const { data, error } = await supabase
          .from("calibration_gas_cell_memos")
          .update({
            memo: trimmed,
            updated_by: userName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        setMemos((prev) => ({ ...prev, [memoKey(rowId, colKey)]: data as CellMemo }));
      } else {
        const { data, error } = await supabase
          .from("calibration_gas_cell_memos")
          .insert({
            inventory_item_id: rowId,
            column_key: colKey,
            memo: trimmed,
            updated_by: userName,
          })
          .select()
          .single();
        if (error) throw error;
        setMemos((prev) => ({ ...prev, [memoKey(rowId, colKey)]: data as CellMemo }));
      }
    },
    [memos],
  );

  return { memos, loading, getMemo, saveMemo, reload };
}
