
CREATE OR REPLACE FUNCTION public.update_user_role_after_onboarding(user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate the role
  IF user_role NOT IN ('service_provider', 'hall_owner', 'dress_seller') THEN
    RAISE EXCEPTION 'Invalid role: %', user_role;
  END IF;

  -- Ensure the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert or update the user's role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Also ensure they have the base 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark onboarding as completed
  UPDATE public.profiles
  SET onboarding_completed = true
  WHERE id = auth.uid();
END;
$$;
