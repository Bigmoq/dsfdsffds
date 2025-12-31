-- Function to notify hall owner on new booking
CREATE OR REPLACE FUNCTION public.notify_hall_owner_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  hall_owner_id UUID;
  hall_name TEXT;
  customer_name TEXT;
BEGIN
  -- Get hall owner and name
  SELECT owner_id, name_ar INTO hall_owner_id, hall_name
  FROM public.halls
  WHERE id = NEW.hall_id;

  -- Get customer name
  SELECT full_name INTO customer_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Insert notification for hall owner
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (
    hall_owner_id,
    'طلب حجز جديد',
    'تم استلام طلب حجز جديد لقاعة ' || hall_name || ' من ' || COALESCE(customer_name, 'عميل') || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY'),
    'info',
    'hall_booking',
    NEW.id
  );

  RETURN NEW;
END;
$function$;

-- Trigger for new hall bookings
DROP TRIGGER IF EXISTS on_new_hall_booking ON public.hall_bookings;
CREATE TRIGGER on_new_hall_booking
  AFTER INSERT ON public.hall_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_hall_owner_new_booking();

-- Function to notify service provider on new booking
CREATE OR REPLACE FUNCTION public.notify_service_provider_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  provider_owner_id UUID;
  provider_name TEXT;
  customer_name TEXT;
BEGIN
  -- Get provider owner and name
  SELECT owner_id, name_ar INTO provider_owner_id, provider_name
  FROM public.service_providers
  WHERE id = NEW.provider_id;

  -- Get customer name
  SELECT full_name INTO customer_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Insert notification for provider owner
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (
    provider_owner_id,
    'طلب حجز جديد',
    'تم استلام طلب حجز جديد لخدمة ' || provider_name || ' من ' || COALESCE(customer_name, 'عميل') || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY'),
    'info',
    'service_booking',
    NEW.id
  );

  RETURN NEW;
END;
$function$;

-- Trigger for new service bookings
DROP TRIGGER IF EXISTS on_new_service_booking ON public.service_bookings;
CREATE TRIGGER on_new_service_booking
  AFTER INSERT ON public.service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_service_provider_new_booking();