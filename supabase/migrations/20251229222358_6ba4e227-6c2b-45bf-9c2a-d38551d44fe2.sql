-- Create storage bucket for hall images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hall-images', 'hall-images', true);

-- Allow authenticated users to upload hall images
CREATE POLICY "Users can upload hall images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hall-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view hall images (public bucket)
CREATE POLICY "Anyone can view hall images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hall-images');

-- Allow users to update their own hall images
CREATE POLICY "Users can update own hall images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'hall-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own hall images
CREATE POLICY "Users can delete own hall images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hall-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);