CREATE TABLE public.calibration_gas_cell_merges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_key text NOT NULL,
  inventory_item_id uuid NOT NULL,
  merge_group_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT '',
  UNIQUE (column_key, inventory_item_id)
);
ALTER TABLE public.calibration_gas_cell_merges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read calibration_gas_cell_merges" ON public.calibration_gas_cell_merges FOR SELECT USING (true);
CREATE POLICY "Anyone can insert calibration_gas_cell_merges" ON public.calibration_gas_cell_merges FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update calibration_gas_cell_merges" ON public.calibration_gas_cell_merges FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete calibration_gas_cell_merges" ON public.calibration_gas_cell_merges FOR DELETE USING (true);
CREATE INDEX idx_cgcm_group ON public.calibration_gas_cell_merges (column_key, merge_group_id);
CREATE INDEX idx_cgcm_item ON public.calibration_gas_cell_merges (inventory_item_id);