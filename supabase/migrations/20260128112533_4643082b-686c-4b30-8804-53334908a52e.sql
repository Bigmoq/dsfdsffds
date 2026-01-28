-- Enable pg_cron and pg_net extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update the service booking status change trigger to prompt for review on completion
CREATE OR REPLACE FUNCTION public.notify_service_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  provider_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  notification_ref_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get provider name
  SELECT name_ar INTO provider_name
  FROM public.service_providers
  WHERE id = NEW.provider_id;

  -- Set notification based on new status
  IF NEW.status = 'confirmed' THEN
    notification_title := 'تم تأكيد حجزك';
    notification_message := 'تم تأكيد حجزك مع ' || provider_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'success';
    notification_ref_type := 'service_booking';
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    notification_title := 'تم إلغاء الحجز';
    notification_message := 'تم إلغاء حجزك مع ' || provider_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'warning';
    notification_ref_type := 'service_booking';
  ELSIF NEW.status = 'completed' THEN
    notification_title := 'تم إكمال الخدمة - شاركنا رأيك! ⭐';
    notification_message := 'تم إكمال خدمتك مع ' || provider_name || '. قيّم تجربتك لمساعدة الآخرين!';
    notification_type := 'info';
    notification_ref_type := 'service_review_prompt';
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (NEW.user_id, notification_title, notification_message, notification_type, notification_ref_type, NEW.provider_id);

  RETURN NEW;
END;
$function$;

-- Also update hall booking status change trigger to prompt for review
CREATE OR REPLACE FUNCTION public.notify_hall_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  hall_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  notification_ref_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get hall name
  SELECT name_ar INTO hall_name
  FROM public.halls
  WHERE id = NEW.hall_id;

  -- Set notification based on new status
  IF NEW.status = 'accepted' THEN
    notification_title := 'تم تأكيد حجز القاعة';
    notification_message := 'تم تأكيد حجزك لقاعة ' || hall_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'success';
    notification_ref_type := 'hall_booking';
  ELSIF NEW.status = 'rejected' THEN
    notification_title := 'تم رفض حجز القاعة';
    notification_message := 'عذراً، تم رفض حجزك لقاعة ' || hall_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'error';
    notification_ref_type := 'hall_booking';
  ELSIF NEW.status = 'cancelled' THEN
    notification_title := 'تم إلغاء حجز القاعة';
    notification_message := 'تم إلغاء حجزك لقاعة ' || hall_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'warning';
    notification_ref_type := 'hall_booking';
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (NEW.user_id, notification_title, notification_message, notification_type, notification_ref_type, NEW.hall_id);

  RETURN NEW;
END;
$function$;