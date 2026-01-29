
-- =====================================================
-- SECURITY FIX: Set search_path on update_conversation_timestamp function
-- This prevents potential search path manipulation attacks
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;
