-- =============================================
-- ملف الهجرة الكامل لمشروع زفاف
-- Complete Migration File for Zafaf Project
-- تاريخ التصدير: 2026-02-09
-- =============================================

-- =============================================
-- الجزء 1: الأنواع (ENUMS)
-- =============================================

CREATE TYPE public.app_role AS ENUM ('user', 'hall_owner', 'service_provider', 'dress_seller', 'admin');
CREATE TYPE public.availability_status AS ENUM ('available', 'booked', 'resale', 'unavailable');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
CREATE TYPE public.service_availability_status AS ENUM ('available', 'booked', 'unavailable');
CREATE TYPE public.vendor_role AS ENUM ('hall_owner', 'service_provider', 'dress_seller');
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================
-- الجزء 2: الجداول الأساسية
-- =============================================

-- جدول الملفات الشخصية
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    city TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    vendor_welcome_seen BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الأدوار
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- جدول القاعات
CREATE TABLE public.halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    price_weekday INTEGER NOT NULL,
    price_weekend INTEGER NOT NULL,
    pricing_type TEXT DEFAULT 'total',
    price_per_chair_weekday INTEGER,
    price_per_chair_weekend INTEGER,
    capacity_men INTEGER NOT NULL,
    capacity_women INTEGER NOT NULL,
    min_capacity_men INTEGER DEFAULT 0,
    min_capacity_women INTEGER DEFAULT 0,
    cover_image TEXT,
    gallery_images TEXT[],
    features TEXT[],
    phone TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول توفر القاعات
CREATE TABLE public.hall_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status availability_status DEFAULT 'available',
    notes TEXT,
    resale_discount INTEGER,
    UNIQUE (hall_id, date)
);

-- جدول حجوزات القاعات
CREATE TABLE public.hall_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    status booking_status DEFAULT 'pending',
    guest_count_men INTEGER,
    guest_count_women INTEGER,
    total_price INTEGER,
    notes TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تقييمات القاعات
CREATE TABLE public.hall_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.hall_bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول مقدمي الخدمات
CREATE TABLE public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    city TEXT NOT NULL,
    phone TEXT,
    portfolio_images TEXT[],
    work_days TEXT[],
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول باقات الخدمات
CREATE TABLE public.service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول توفر مقدمي الخدمات
CREATE TABLE public.service_provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status service_availability_status DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (provider_id, date)
);

-- جدول حجوزات الخدمات
CREATE TABLE public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    total_price INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تقييمات مقدمي الخدمات
CREATE TABLE public.service_provider_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الفساتين
CREATE TABLE public.dresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    size TEXT NOT NULL,
    condition TEXT DEFAULT 'used',
    category TEXT DEFAULT 'wedding',
    city TEXT NOT NULL,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_sold BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المفضلات (القاعات)
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, hall_id)
);

-- جدول مفضلات الخدمات
CREATE TABLE public.service_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, provider_id)
);

-- جدول مفضلات الفساتين
CREATE TABLE public.dress_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    dress_id UUID REFERENCES public.dresses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, dress_id)
);

-- جدول طلبات البائعين
CREATE TABLE public.vendor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role vendor_role NOT NULL,
    business_name TEXT NOT NULL,
    business_description TEXT,
    status vendor_status DEFAULT 'pending',
    applied_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- جدول الإشعارات
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الشكاوى
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    reference_type TEXT,
    reference_id UUID,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الإعلانات
CREATE TABLE public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT DEFAULT 'home',
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المحادثات
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    dress_id UUID REFERENCES public.dresses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الرسائل
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التحليلات
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_path TEXT,
    session_id TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الجزء 3: الدوال (FUNCTIONS)
-- =============================================

-- دالة التحقق من الدور
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- دالة الحصول على دور المستخدم
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- دالة إنشاء ملف شخصي للمستخدم الجديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger لإنشاء الملف الشخصي تلقائياً
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة تحديث وقت التعديل
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- دالة الحصول على تقييم القاعة
CREATE OR REPLACE FUNCTION public.get_hall_rating(hall_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, reviews_count BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.hall_reviews
  WHERE hall_id = hall_uuid;
$$;

-- دالة الحصول على تقييم مقدم الخدمة
CREATE OR REPLACE FUNCTION public.get_service_provider_rating(provider_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, reviews_count BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_uuid;
$$;

-- دالة تحديث تقييم مقدم الخدمة
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_id_val UUID;
  avg_rating NUMERIC;
  review_count BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    provider_id_val := OLD.provider_id;
  ELSE
    provider_id_val := NEW.provider_id;
  END IF;

  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_id_val;

  UPDATE public.service_providers
  SET rating = avg_rating, reviews_count = review_count
  WHERE id = provider_id_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER update_service_provider_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.service_provider_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- دالة تحديث وقت المحادثة
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- =============================================
-- الجزء 4: سياسات أمان الصفوف (RLS)
-- =============================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- سياسات profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user_roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all user_roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات halls
CREATE POLICY "Active halls are viewable by everyone" ON public.halls FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own halls" ON public.halls FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all halls" ON public.halls FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all halls" ON public.halls FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete halls" ON public.halls FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات hall_availability
CREATE POLICY "Hall availability is public" ON public.hall_availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage hall availability" ON public.hall_availability FOR ALL USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_availability.hall_id AND halls.owner_id = auth.uid()));

-- سياسات hall_bookings
CREATE POLICY "Users can view own bookings" ON public.hall_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.hall_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hall bookings" ON public.hall_bookings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Hall owners can view their bookings" ON public.hall_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_bookings.hall_id AND halls.owner_id = auth.uid()));
CREATE POLICY "Hall owners can update bookings" ON public.hall_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_bookings.hall_id AND halls.owner_id = auth.uid()));
CREATE POLICY "Admins can view all hall_bookings" ON public.hall_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all hall_bookings" ON public.hall_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hall_bookings" ON public.hall_bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات hall_reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.hall_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for booked halls" ON public.hall_reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM hall_bookings WHERE hall_bookings.hall_id = hall_reviews.hall_id AND hall_bookings.user_id = auth.uid() AND hall_bookings.status = 'accepted'));
CREATE POLICY "Users can update own reviews" ON public.hall_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.hall_reviews FOR DELETE USING (auth.uid() = user_id);

-- سياسات service_providers
CREATE POLICY "Service providers are viewable by everyone" ON public.service_providers FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own services" ON public.service_providers FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all service_providers" ON public.service_providers FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all service_providers" ON public.service_providers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service_providers" ON public.service_providers FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات service_packages
CREATE POLICY "Packages are viewable by everyone" ON public.service_packages FOR SELECT USING (true);
CREATE POLICY "Owners can manage own packages" ON public.service_packages FOR ALL USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_packages.provider_id AND service_providers.owner_id = auth.uid()));

-- سياسات service_provider_availability
CREATE POLICY "Availability is viewable by everyone" ON public.service_provider_availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage availability" ON public.service_provider_availability FOR ALL USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_provider_availability.provider_id AND service_providers.owner_id = auth.uid()));

-- سياسات service_bookings
CREATE POLICY "Users can view own service bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create service bookings" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own service bookings" ON public.service_bookings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Providers can view their service bookings" ON public.service_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_bookings.provider_id AND service_providers.owner_id = auth.uid()));
CREATE POLICY "Providers can update service bookings" ON public.service_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_bookings.provider_id AND service_providers.owner_id = auth.uid()));
CREATE POLICY "Admins can view all service_bookings" ON public.service_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all service_bookings" ON public.service_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service_bookings" ON public.service_bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات service_provider_reviews
CREATE POLICY "Service reviews are viewable by everyone" ON public.service_provider_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for booked services" ON public.service_provider_reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM service_bookings WHERE service_bookings.provider_id = service_provider_reviews.provider_id AND service_bookings.user_id = auth.uid() AND service_bookings.status IN ('confirmed', 'completed')));
CREATE POLICY "Users can update own service reviews" ON public.service_provider_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own service reviews" ON public.service_provider_reviews FOR DELETE USING (auth.uid() = user_id);

-- سياسات dresses
CREATE POLICY "Active dresses are viewable by everyone" ON public.dresses FOR SELECT USING (is_active = true AND is_sold = false);
CREATE POLICY "Sellers can manage own dresses" ON public.dresses FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can view own dresses" ON public.dresses FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can view all dresses" ON public.dresses FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all dresses" ON public.dresses FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete dresses" ON public.dresses FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- سياسات service_favorites
CREATE POLICY "Users can view own service favorites" ON public.service_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own service favorites" ON public.service_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own service favorites" ON public.service_favorites FOR DELETE USING (auth.uid() = user_id);

-- سياسات dress_favorites
CREATE POLICY "Users can view own dress favorites" ON public.dress_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dress favorites" ON public.dress_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dress favorites" ON public.dress_favorites FOR DELETE USING (auth.uid() = user_id);

-- سياسات vendor_applications
CREATE POLICY "Users can view own applications" ON public.vendor_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON public.vendor_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON public.vendor_applications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications" ON public.vendor_applications FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- سياسات notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- سياسات complaints
CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all complaints" ON public.complaints FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- سياسات advertisements
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage advertisements" ON public.advertisements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- سياسات conversations
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can update their conversations" ON public.conversations FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- سياسات chat_messages
CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));

-- سياسات analytics_events
CREATE POLICY "Authenticated users can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete analytics" ON public.analytics_events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- الجزء 5: Views العامة
-- =============================================

CREATE OR REPLACE VIEW public.public_halls AS
SELECT id, owner_id, name_ar, name_en, description, city, address,
       price_weekday, price_weekend, pricing_type, price_per_chair_weekday, price_per_chair_weekend,
       capacity_men, capacity_women, min_capacity_men, min_capacity_women,
       cover_image, gallery_images, features, latitude, longitude,
       whatsapp_enabled, is_active, created_at, updated_at
FROM public.halls
WHERE is_active = true;

CREATE OR REPLACE VIEW public.public_service_providers AS
SELECT id, owner_id, category_id, name_ar, name_en, description, city,
       portfolio_images, work_days, rating, reviews_count,
       whatsapp_enabled, is_active, created_at, updated_at
FROM public.service_providers
WHERE is_active = true;

CREATE OR REPLACE VIEW public.public_dresses AS
SELECT id, seller_id, title, description, price, size, condition, category, city,
       images, whatsapp_enabled, is_active, is_sold, created_at, updated_at
FROM public.dresses
WHERE is_active = true AND is_sold = false;

-- =============================================
-- الجزء 6: Storage Buckets
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('hall-images', 'hall-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('dress-images', 'dress-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true) ON CONFLICT DO NOTHING;

-- سياسات التخزين
CREATE POLICY "Public read for hall-images" ON storage.objects FOR SELECT USING (bucket_id = 'hall-images');
CREATE POLICY "Authenticated upload for hall-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hall-images' AND auth.role() = 'authenticated');
CREATE POLICY "Owner delete for hall-images" ON storage.objects FOR DELETE USING (bucket_id = 'hall-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read for service-images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Authenticated upload for service-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');
CREATE POLICY "Owner delete for service-images" ON storage.objects FOR DELETE USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read for dress-images" ON storage.objects FOR SELECT USING (bucket_id = 'dress-images');
CREATE POLICY "Authenticated upload for dress-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dress-images' AND auth.role() = 'authenticated');
CREATE POLICY "Owner delete for dress-images" ON storage.objects FOR DELETE USING (bucket_id = 'dress-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated upload for avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Owner delete for avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read for chat-images" ON storage.objects FOR SELECT USING (bucket_id = 'chat-images');
CREATE POLICY "Authenticated upload for chat-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- =============================================
-- الجزء 7: البيانات التجريبية
-- استبدل PLACEHOLDER_USER_ID بمعرف المستخدم الفعلي
-- =============================================

-- ملاحظة مهمة:
-- 1. أنشئ المستخدمين في Authentication → Users
-- 2. استبدل 'PLACEHOLDER_USER_ID' بالمعرف الفعلي (UUID) للمستخدم
-- 3. نفذ الأوامر التالية بعد الاستبدال

-- مثال على إضافة الأدوار:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_ADMIN_USER_ID', 'admin');
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_HALL_OWNER_USER_ID', 'hall_owner');
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_SERVICE_PROVIDER_USER_ID', 'service_provider');

-- =============================================
-- نهاية الملف
-- =============================================
