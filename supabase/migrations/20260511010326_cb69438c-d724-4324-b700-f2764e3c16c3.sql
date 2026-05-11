CREATE POLICY "Anyone can delete report_versions"
ON public.report_versions
FOR DELETE
TO anon, authenticated
USING (true);