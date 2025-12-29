-- Create storage bucket for dress images
INSERT INTO storage.buckets (id, name, public)
VALUES ('dress-images', 'dress-images', true);

-- Allow authenticated users to upload dress images
CREATE POLICY "Users can upload dress images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dress-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view dress images (public bucket)
CREATE POLICY "Anyone can view dress images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dress-images');

-- Allow users to update their own dress images
CREATE POLICY "Users can update own dress images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own dress images
CREATE POLICY "Users can delete own dress images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);