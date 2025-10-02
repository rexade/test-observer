-- Create storage bucket for test artifacts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-artifacts',
  'test-artifacts',
  true,
  10485760, -- 10MB limit
  ARRAY['text/plain', 'text/html', 'application/xml', 'application/json', 'text/xml']
);

-- RLS policy: anyone can read artifacts
CREATE POLICY "Public read access to test artifacts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'test-artifacts');

-- RLS policy: service role can upload artifacts
CREATE POLICY "Service role can upload test artifacts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'test-artifacts'
);