-- Create storage bucket for report revision files
INSERT INTO storage.buckets (id, name, public) VALUES ('report-files', 'report-files', true);

-- Allow anyone to upload files
CREATE POLICY "Anyone can upload report files"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'report-files');

-- Allow anyone to read files
CREATE POLICY "Anyone can read report files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'report-files');

-- Allow anyone to delete files
CREATE POLICY "Anyone can delete report files"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'report-files');