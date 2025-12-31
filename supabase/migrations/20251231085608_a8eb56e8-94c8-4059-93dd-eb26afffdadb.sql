
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (using service role or triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Function to create notification on service booking status change
CREATE OR REPLACE FUNCTION public.notify_service_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
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
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    notification_title := 'تم إلغاء الحجز';
    notification_message := 'تم إلغاء حجزك مع ' || provider_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'warning';
  ELSIF NEW.status = 'completed' THEN
    notification_title := 'تم إكمال الخدمة';
    notification_message := 'تم إكمال خدمتك مع ' || provider_name || '. شكراً لثقتك!';
    notification_type := 'info';
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (NEW.user_id, notification_title, notification_message, notification_type, 'service_booking', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for service booking status changes
CREATE TRIGGER on_service_booking_status_change
AFTER UPDATE ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_service_booking_status_change();

-- Function to create notification on hall booking status change  
CREATE OR REPLACE FUNCTION public.notify_hall_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  hall_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
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
  ELSIF NEW.status = 'rejected' THEN
    notification_title := 'تم رفض حجز القاعة';
    notification_message := 'عذراً، تم رفض حجزك لقاعة ' || hall_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'error';
  ELSIF NEW.status = 'cancelled' THEN
    notification_title := 'تم إلغاء حجز القاعة';
    notification_message := 'تم إلغاء حجزك لقاعة ' || hall_name || ' بتاريخ ' || to_char(NEW.booking_date, 'DD/MM/YYYY');
    notification_type := 'warning';
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, reference_type, reference_id)
  VALUES (NEW.user_id, notification_title, notification_message, notification_type, 'hall_booking', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for hall booking status changes
CREATE TRIGGER on_hall_booking_status_change
AFTER UPDATE ON public.hall_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_hall_booking_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
