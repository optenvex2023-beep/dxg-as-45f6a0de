ALTER TABLE public.inspection_reports ADD COLUMN manufacturing_review_completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.inspection_reports ADD COLUMN manufacturing_reviewed_at timestamptz;