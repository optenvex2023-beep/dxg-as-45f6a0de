ALTER TABLE public.outbound_inspections ADD COLUMN is_closed boolean NOT NULL DEFAULT false;
ALTER TABLE public.outbound_inspections ADD COLUMN closed_at timestamp with time zone DEFAULT NULL;