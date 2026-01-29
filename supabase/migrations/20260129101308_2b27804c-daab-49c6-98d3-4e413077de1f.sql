-- =====================================================
-- SECURITY FIX: Remove dangerous RLS policies that allow users to modify their own roles
-- This prevents privilege escalation attacks
-- =====================================================

-- Drop the dangerous policies that allow users to insert/update their own roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- =====================================================
-- Create a secure function to assign initial user role during onboarding
-- This uses SECURITY DEFINER to bypass RLS and only allows 'user' role assignment
-- =====================================================
CREATE OR REPLACE FUNCTION public.assign_initial_user_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_role_count integer;
BEGIN
  -- Verify the caller is the same user (basic security check)
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot assign role for another user';
  END IF;
  
  -- Check if user already has any role
  SELECT COUNT(*) INTO existing_role_count
  FROM public.user_roles
  WHERE user_id = p_user_id;
  
  -- Only allow if user has no roles yet (prevents multiple calls)
  IF existing_role_count > 0 THEN
    RETURN true; -- Already has a role, silently succeed
  END IF;
  
  -- Insert only the 'user' role - never allow escalation
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'user');
  
  RETURN true;
END;
$$;

-- =====================================================
-- STORAGE FIX: Fix chat-images bucket policy to enforce folder ownership
-- =====================================================

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;

-- Create a secure policy that requires users to upload to their own folder
CREATE POLICY "Users can upload to own chat folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure there's a SELECT policy for chat-images (public read)
DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;
CREATE POLICY "Chat images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Ensure there's a DELETE policy for chat-images (users can delete their own)
DROP POLICY IF EXISTS "Users can delete own chat images" ON storage.objects;
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);