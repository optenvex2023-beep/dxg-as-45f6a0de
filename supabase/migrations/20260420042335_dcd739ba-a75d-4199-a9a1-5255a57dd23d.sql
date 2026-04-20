-- Cell-level memos for the Calibration Gas inventory table
CREATE TABLE IF NOT EXISTS public.calibration_gas_cell_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.calibration_gas_inventory(id) ON DELETE CASCADE,
  column_key TEXT NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL DEFAULT '',
  UNIQUE (inventory_item_id, column_key)
);

ALTER TABLE public.calibration_gas_cell_memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calibration_gas_cell_memos"
  ON public.calibration_gas_cell_memos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert calibration_gas_cell_memos"
  ON public.calibration_gas_cell_memos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update calibration_gas_cell_memos"
  ON public.calibration_gas_cell_memos FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete calibration_gas_cell_memos"
  ON public.calibration_gas_cell_memos FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cal_gas_cell_memos_item ON public.calibration_gas_cell_memos(inventory_item_id);