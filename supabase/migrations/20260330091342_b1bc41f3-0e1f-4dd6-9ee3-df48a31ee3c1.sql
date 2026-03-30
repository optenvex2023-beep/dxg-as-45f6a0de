ALTER TABLE public.report_versions
ADD COLUMN IF NOT EXISTS file_path text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.report_versions.file_path IS 'Storage object key path (e.g. first/{report_id}/{uuid}.ext)';