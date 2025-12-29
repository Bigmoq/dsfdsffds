-- Create storage bucket for service provider images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Allow authenticated users to upload service images
CREATE POLICY "Users can upload service images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view service images (public bucket)
CREATE POLICY "Anyone can view service images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'service-images');

-- Allow users to update their own service images
CREATE POLICY "Users can update own service images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own service images
CREATE POLICY "Users can delete own service images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);