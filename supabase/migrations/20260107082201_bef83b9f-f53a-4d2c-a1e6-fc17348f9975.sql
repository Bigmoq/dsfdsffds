
-- Create a function to notify all admins when a new vendor application is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_new_vendor_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_user RECORD;
  applicant_name TEXT;
  role_label TEXT;
BEGIN
  -- Get applicant name
  SELECT full_name INTO applicant_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get role label in Arabic
  CASE NEW.role
    WHEN 'hall_owner' THEN role_label := 'صاحب قاعة';
    WHEN 'service_provider' THEN role_label := 'مقدم خدمة';
    WHEN 'dress_seller' THEN role_label := 'بائع فساتين';
    ELSE role_label := 'بائع';
  END CASE;

  -- Loop through all admin users and send them a notification
  FOR admin_user IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
    VALUES (
      admin_user.user_id,
      'طلب بائع جديد',
      'تم استلام طلب انضمام جديد من ' || COALESCE(applicant_name, 'مستخدم') || ' كـ ' || role_label || ' - ' || NEW.business_name,
      'info',
      'vendor_application',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create the trigger on vendor_applications table
DROP TRIGGER IF EXISTS on_new_vendor_application ON public.vendor_applications;
CREATE TRIGGER on_new_vendor_application
  AFTER INSERT ON public.vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_vendor_application();
