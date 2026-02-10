
-- Trigger function to notify vendor on application status change
CREATE OR REPLACE FUNCTION public.notify_vendor_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  role_label TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get role label
  CASE NEW.role
    WHEN 'hall_owner' THEN role_label := 'صاحب قاعة';
    WHEN 'service_provider' THEN role_label := 'مقدم خدمة';
    WHEN 'dress_seller' THEN role_label := 'بائع فساتين';
    ELSE role_label := 'بائع';
  END CASE;

  IF NEW.status = 'approved' THEN
    notification_title := 'تم تفعيل حسابك! 🎉';
    notification_message := 'تمت الموافقة على طلبك كـ ' || role_label || '. يمكنك الآن إضافة خدماتك وبدء استقبال الحجوزات.';
    notification_type := 'success';
  ELSIF NEW.status = 'rejected' THEN
    notification_title := 'تم رفض الطلب';
    notification_message := 'عذراً، تم رفض طلب انضمامك كـ ' || role_label || '. يمكنك التواصل مع الإدارة لمزيد من التفاصيل.';
    notification_type := 'error';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (NEW.user_id, notification_title, notification_message, notification_type, 'vendor_application', NEW.id);

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_vendor_application_status_change ON public.vendor_applications;
CREATE TRIGGER on_vendor_application_status_change
  AFTER UPDATE ON public.vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_application_status();
