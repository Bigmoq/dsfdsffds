-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat images
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add images column to chat_messages table
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS images text[] DEFAULT NULL;