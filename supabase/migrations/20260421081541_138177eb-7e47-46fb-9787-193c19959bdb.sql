ALTER TABLE public.outbound_inspections
  ADD COLUMN IF NOT EXISTS outbound_date_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reinstall_date_note text NOT NULL DEFAULT '';