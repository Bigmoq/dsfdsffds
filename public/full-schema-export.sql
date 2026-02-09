-- ============================================
-- تصدير كامل لقاعدة بيانات تطبيق زفاف
-- يشمل: Types، الجداول، RLS Policies، Functions، Triggers، البيانات
-- تاريخ التصدير: 2026-02-09
-- ============================================

-- ⚠️ تعليمات الاستيراد:
-- 1. أنشئ مشروع Supabase جديد
-- 2. اذهب إلى SQL Editor
-- 3. الصق هذا الملف بالكامل واضغط Run
-- 4. أنشئ المستخدمين في Authentication
-- 5. حدّث الـ user IDs في البيانات

-- ============================================
-- الجزء 1: إنشاء الـ ENUM Types
-- ============================================

-- App Role Enum
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('user', 'hall_owner', 'service_provider', 'dress_seller', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Availability Status Enum
DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'booked', 'resale', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Booking Status Enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Service Availability Status Enum
DO $$ BEGIN
  CREATE TYPE service_availability_status AS ENUM ('available', 'booked', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Vendor Role Enum
DO $$ BEGIN
  CREATE TYPE vendor_role AS ENUM ('hall_owner', 'service_provider', 'dress_seller');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Vendor Status Enum
DO $$ BEGIN
  CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- الجزء 2: إنشاء الجداول
-- ============================================

-- جدول الملفات الشخصية (مرتبط بـ auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  vendor_welcome_seen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول أدوار المستخدمين
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- جدول القاعات
CREATE TABLE IF NOT EXISTS public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  capacity_men INTEGER NOT NULL,
  capacity_women INTEGER NOT NULL,
  min_capacity_men INTEGER DEFAULT 0,
  min_capacity_women INTEGER DEFAULT 0,
  price_weekday INTEGER NOT NULL,
  price_weekend INTEGER NOT NULL,
  price_per_chair_weekday INTEGER,
  price_per_chair_weekend INTEGER,
  pricing_type TEXT DEFAULT 'total',
  cover_image TEXT,
  gallery_images TEXT[],
  features TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  whatsapp_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول توفر القاعات
CREATE TABLE IF NOT EXISTS public.hall_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status DEFAULT 'available',
  resale_discount INTEGER,
  notes TEXT,
  UNIQUE(hall_id, date)
);

-- جدول حجوزات القاعات
CREATE TABLE IF NOT EXISTS public.hall_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status booking_status DEFAULT 'pending',
  guest_count_men INTEGER,
  guest_count_women INTEGER,
  total_price INTEGER,
  notes TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول تقييمات القاعات
CREATE TABLE IF NOT EXISTS public.hall_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.hall_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول مفضلات القاعات
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, hall_id)
);

-- جدول مقدمي الخدمات
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  category_id TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  portfolio_images TEXT[],
  work_days TEXT[],
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  whatsapp_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول باقات الخدمات
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول توفر مقدمي الخدمات
CREATE TABLE IF NOT EXISTS public.service_provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status service_availability_status DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- جدول حجوزات الخدمات
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول تقييمات مقدمي الخدمات
CREATE TABLE IF NOT EXISTS public.service_provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول مفضلات الخدمات
CREATE TABLE IF NOT EXISTS public.service_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- جدول الفساتين
CREATE TABLE IF NOT EXISTS public.dresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  size TEXT NOT NULL,
  condition TEXT DEFAULT 'used',
  city TEXT NOT NULL,
  category TEXT DEFAULT 'wedding',
  images TEXT[],
  whatsapp_enabled BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول مفضلات الفساتين
CREATE TABLE IF NOT EXISTS public.dress_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, dress_id)
);

-- جدول طلبات البائعين
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role vendor_role NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  status vendor_status DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول المحادثات
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
  dress_id UUID REFERENCES public.dresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول رسائل المحادثات
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الشكاوى
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_response TEXT,
  reference_type TEXT,
  reference_id UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الإعلانات
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'home',
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول أحداث التحليلات
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- الجزء 3: إنشاء Views للعرض العام
-- ============================================

CREATE OR REPLACE VIEW public.public_halls AS
SELECT 
  id, owner_id, name_ar, name_en, city, address, description,
  capacity_men, capacity_women, min_capacity_men, min_capacity_women,
  price_weekday, price_weekend, price_per_chair_weekday, price_per_chair_weekend,
  pricing_type, cover_image, gallery_images, features,
  latitude, longitude, whatsapp_enabled, is_active, created_at, updated_at
FROM public.halls
WHERE is_active = true;

CREATE OR REPLACE VIEW public.public_service_providers AS
SELECT 
  id, owner_id, name_ar, name_en, category_id, city, description,
  portfolio_images, work_days, rating, reviews_count,
  whatsapp_enabled, is_active, created_at, updated_at
FROM public.service_providers
WHERE is_active = true;

CREATE OR REPLACE VIEW public.public_dresses AS
SELECT 
  id, seller_id, title, description, price, size, condition,
  city, category, images, whatsapp_enabled, is_sold, is_active,
  created_at, updated_at
FROM public.dresses
WHERE is_active = true AND is_sold = false;

-- ============================================
-- الجزء 4: إنشاء Functions
-- ============================================

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- دالة التحقق من الدور
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- دالة الحصول على دور المستخدم
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY created_at ASC
  LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- دالة تعيين دور المستخدم الجديد
CREATE OR REPLACE FUNCTION public.assign_initial_user_role(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  existing_role_count INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  SELECT COUNT(*) INTO existing_role_count
  FROM public.user_roles WHERE user_id = p_user_id;
  
  IF existing_role_count > 0 THEN
    RETURN true;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'user');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة الحصول على تقييم القاعة
CREATE OR REPLACE FUNCTION public.get_hall_rating(hall_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, reviews_count BIGINT) AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.hall_reviews
  WHERE hall_id = hall_uuid;
$$ LANGUAGE sql STABLE SET search_path = public;

-- دالة الحصول على تقييم مقدم الخدمة
CREATE OR REPLACE FUNCTION public.get_service_provider_rating(provider_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, reviews_count BIGINT) AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_uuid;
$$ LANGUAGE sql STABLE SET search_path = public;

-- دالة تحديث تقييم مقدم الخدمة
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
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

  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_id_val;

  UPDATE public.service_providers
  SET rating = avg_rating, reviews_count = review_count
  WHERE id = provider_id_val;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة تحديث وقت المحادثة
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة إنشاء ملف شخصي للمستخدم الجديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- الجزء 5: إنشاء Triggers
-- ============================================

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_halls_updated_at ON public.halls;
CREATE TRIGGER update_halls_updated_at
  BEFORE UPDATE ON public.halls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dresses_updated_at ON public.dresses;
CREATE TRIGGER update_dresses_updated_at
  BEFORE UPDATE ON public.dresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتحديث تقييم مقدم الخدمة
DROP TRIGGER IF EXISTS update_provider_rating_trigger ON public.service_provider_reviews;
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.service_provider_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- Trigger لتحديث وقت المحادثة
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON public.chat_messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Trigger لإنشاء ملف شخصي للمستخدم الجديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- الجزء 6: تفعيل RLS على جميع الجداول
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- الجزء 7: إنشاء RLS Policies
-- ============================================

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- User Roles Policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user_roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all user_roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Halls Policies
CREATE POLICY "Active halls are viewable by everyone" ON public.halls FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own halls" ON public.halls FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all halls" ON public.halls FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all halls" ON public.halls FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete halls" ON public.halls FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Hall Availability Policies
CREATE POLICY "Hall availability is public" ON public.hall_availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage hall availability" ON public.hall_availability FOR ALL 
  USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_availability.hall_id AND halls.owner_id = auth.uid()));

-- Hall Bookings Policies
CREATE POLICY "Users can view own bookings" ON public.hall_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.hall_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hall bookings" ON public.hall_bookings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Hall owners can view their bookings" ON public.hall_bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_bookings.hall_id AND halls.owner_id = auth.uid()));
CREATE POLICY "Hall owners can update bookings" ON public.hall_bookings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM halls WHERE halls.id = hall_bookings.hall_id AND halls.owner_id = auth.uid()));
CREATE POLICY "Admins can view all hall_bookings" ON public.hall_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all hall_bookings" ON public.hall_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hall_bookings" ON public.hall_bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Hall Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.hall_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for booked halls" ON public.hall_reviews FOR INSERT 
  WITH CHECK ((auth.uid() = user_id) AND EXISTS (
    SELECT 1 FROM hall_bookings 
    WHERE hall_bookings.hall_id = hall_reviews.hall_id 
    AND hall_bookings.user_id = auth.uid() 
    AND hall_bookings.status = 'accepted'
  ));
CREATE POLICY "Users can update own reviews" ON public.hall_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.hall_reviews FOR DELETE USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Service Providers Policies
CREATE POLICY "Service providers are viewable by everyone" ON public.service_providers FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own services" ON public.service_providers FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all service_providers" ON public.service_providers FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all service_providers" ON public.service_providers FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service_providers" ON public.service_providers FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Service Packages Policies
CREATE POLICY "Packages are viewable by everyone" ON public.service_packages FOR SELECT USING (true);
CREATE POLICY "Owners can manage own packages" ON public.service_packages FOR ALL 
  USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_packages.provider_id AND service_providers.owner_id = auth.uid()));

-- Service Provider Availability Policies
CREATE POLICY "Availability is viewable by everyone" ON public.service_provider_availability FOR SELECT USING (true);
CREATE POLICY "Owners can manage availability" ON public.service_provider_availability FOR ALL 
  USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_provider_availability.provider_id AND service_providers.owner_id = auth.uid()));

-- Service Bookings Policies
CREATE POLICY "Users can view own service bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create service bookings" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own service bookings" ON public.service_bookings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Providers can view their service bookings" ON public.service_bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_bookings.provider_id AND service_providers.owner_id = auth.uid()));
CREATE POLICY "Providers can update service bookings" ON public.service_bookings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM service_providers WHERE service_providers.id = service_bookings.provider_id AND service_providers.owner_id = auth.uid()));
CREATE POLICY "Admins can view all service_bookings" ON public.service_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all service_bookings" ON public.service_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service_bookings" ON public.service_bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Service Provider Reviews Policies
CREATE POLICY "Service reviews are viewable by everyone" ON public.service_provider_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for booked services" ON public.service_provider_reviews FOR INSERT 
  WITH CHECK ((auth.uid() = user_id) AND EXISTS (
    SELECT 1 FROM service_bookings 
    WHERE service_bookings.provider_id = service_provider_reviews.provider_id 
    AND service_bookings.user_id = auth.uid() 
    AND service_bookings.status IN ('confirmed', 'completed')
  ));
CREATE POLICY "Users can update own service reviews" ON public.service_provider_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own service reviews" ON public.service_provider_reviews FOR DELETE USING (auth.uid() = user_id);

-- Service Favorites Policies
CREATE POLICY "Users can view own service favorites" ON public.service_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own service favorites" ON public.service_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own service favorites" ON public.service_favorites FOR DELETE USING (auth.uid() = user_id);

-- Dresses Policies
CREATE POLICY "Active dresses are viewable by everyone" ON public.dresses FOR SELECT USING ((is_active = true) AND (is_sold = false));
CREATE POLICY "Sellers can manage own dresses" ON public.dresses FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can view own dresses" ON public.dresses FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can view all dresses" ON public.dresses FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all dresses" ON public.dresses FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete dresses" ON public.dresses FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Dress Favorites Policies
CREATE POLICY "Users can view own dress favorites" ON public.dress_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dress favorites" ON public.dress_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dress favorites" ON public.dress_favorites FOR DELETE USING (auth.uid() = user_id);

-- Vendor Applications Policies
CREATE POLICY "Users can view own applications" ON public.vendor_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON public.vendor_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON public.vendor_applications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications" ON public.vendor_applications FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING ((auth.uid() = participant_1) OR (auth.uid() = participant_2));
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = participant_1) OR (auth.uid() = participant_2));
CREATE POLICY "Users can update their conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = participant_1) OR (auth.uid() = participant_2));

-- Chat Messages Policies
CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages FOR INSERT 
  WITH CHECK ((auth.uid() = sender_id) AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = chat_messages.conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));

-- Complaints Policies
CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all complaints" ON public.complaints FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Advertisements Policies
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage advertisements" ON public.advertisements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Analytics Events Policies
CREATE POLICY "Authenticated users can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()));
CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete analytics" ON public.analytics_events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- الجزء 8: إنشاء Storage Buckets
-- ============================================

-- إنشاء الـ Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('hall-images', 'hall-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('service-images', 'service-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('dress-images', 'dress-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('chat-images', 'chat-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- الجزء 9: Storage RLS Policies
-- ============================================

-- === Hall Images Policies ===
-- الجميع يمكنهم مشاهدة صور القاعات
CREATE POLICY "Hall images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hall-images');

-- أصحاب القاعات يمكنهم رفع الصور
CREATE POLICY "Hall owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hall-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'hall_owner') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- أصحاب القاعات يمكنهم تحديث صورهم
CREATE POLICY "Hall owners can update their images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hall-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'hall_owner') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- أصحاب القاعات يمكنهم حذف صورهم
CREATE POLICY "Hall owners can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hall-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'hall_owner') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- === Service Images Policies ===
-- الجميع يمكنهم مشاهدة صور الخدمات
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- مقدمو الخدمات يمكنهم رفع الصور
CREATE POLICY "Service providers can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'service_provider') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- مقدمو الخدمات يمكنهم تحديث صورهم
CREATE POLICY "Service providers can update their images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'service_provider') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- مقدمو الخدمات يمكنهم حذف صورهم
CREATE POLICY "Service providers can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'service_provider') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- === Dress Images Policies ===
-- الجميع يمكنهم مشاهدة صور الفساتين
CREATE POLICY "Dress images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'dress-images');

-- بائعو الفساتين يمكنهم رفع الصور
CREATE POLICY "Dress sellers can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dress-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'dress_seller') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- بائعو الفساتين يمكنهم تحديث صورهم
CREATE POLICY "Dress sellers can update their images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'dress_seller') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- بائعو الفساتين يمكنهم حذف صورهم
CREATE POLICY "Dress sellers can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'dress_seller') 
    OR has_role(auth.uid(), 'admin')
  )
);

-- === Avatars Policies ===
-- الجميع يمكنهم مشاهدة الصور الشخصية
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- المستخدمون يمكنهم رفع صورهم الشخصية في مجلدهم فقط
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- المستخدمون يمكنهم تحديث صورهم الشخصية
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- المستخدمون يمكنهم حذف صورهم الشخصية
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- === Chat Images Policies ===
-- المستخدمون في المحادثة يمكنهم مشاهدة الصور
CREATE POLICY "Chat images are viewable by conversation participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-images'
  AND auth.uid() IS NOT NULL
);

-- المستخدمون يمكنهم رفع صور في مجلدهم فقط
CREATE POLICY "Users can upload chat images to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- المستخدمون يمكنهم حذف صورهم في المحادثات
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- الجزء 10: البيانات التجريبية
-- ============================================

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║                    ⚠️ تعليمات مهمة جداً ⚠️                          ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║                                                                    ║
-- ║  قبل تنفيذ البيانات التجريبية، يجب عليك:                           ║
-- ║                                                                    ║
-- ║  1. إنشاء مستخدم في Authentication → Users → Add user              ║
-- ║  2. نسخ الـ User ID الخاص به                                       ║
-- ║  3. استبدال الـ PLACEHOLDER_USER_ID أدناه بالـ ID الحقيقي          ║
-- ║                                                                    ║
-- ║  مثال:                                                             ║
-- ║  - القيمة الحالية: 'PLACEHOLDER_USER_ID'                          ║
-- ║  - استبدلها بـ: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'            ║
-- ║                                                                    ║
-- ║  💡 نصيحة: استخدم Find & Replace في محرر النصوص                   ║
-- ║     ابحث عن: PLACEHOLDER_USER_ID                                   ║
-- ║     استبدل بـ: [الـ ID الحقيقي]                                    ║
-- ║                                                                    ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- ============================================
-- 10.1: إنشاء الملف الشخصي للمستخدم
-- ============================================

-- ⚠️ استبدل PLACEHOLDER_USER_ID بالـ User ID الحقيقي
INSERT INTO public.profiles (id, full_name, phone, city, onboarding_completed, vendor_welcome_seen)
VALUES ('PLACEHOLDER_USER_ID', 'مدير النظام', '+966500000000', 'الرياض', true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10.2: إضافة أدوار المستخدم
-- ============================================

-- ⚠️ استبدل PLACEHOLDER_USER_ID بالـ User ID الحقيقي
-- إضافة جميع الأدوار للمستخدم الرئيسي (للتجربة)
INSERT INTO public.user_roles (user_id, role) VALUES ('PLACEHOLDER_USER_ID', 'user') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('PLACEHOLDER_USER_ID', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('PLACEHOLDER_USER_ID', 'hall_owner') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('PLACEHOLDER_USER_ID', 'service_provider') ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('PLACEHOLDER_USER_ID', 'dress_seller') ON CONFLICT DO NOTHING;

-- ============================================
-- 10.3: بيانات القاعات (HALLS)
-- ============================================

-- ⚠️ استبدل PLACEHOLDER_USER_ID بالـ User ID الحقيقي في كل سطر
INSERT INTO public.halls (id, owner_id, name_ar, name_en, city, address, description, capacity_men, capacity_women, min_capacity_men, min_capacity_women, price_weekday, price_weekend, pricing_type, cover_image, features, latitude, longitude, phone, whatsapp_enabled, is_active) VALUES
('1119b8fa-f67e-4cea-a01a-46b9958246fa', 'PLACEHOLDER_USER_ID', 'قاعة الماسة الذهبية', 'Golden Diamond Hall', 'الرياض', 'حي النخيل، شارع الملك فهد', 'قاعة فاخرة للمناسبات والأفراح، تتميز بديكورات راقية وخدمات متكاملة', 300, 250, 0, 0, 15000, 20000, 'total', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', ARRAY['موقف سيارات', 'تكييف مركزي', 'مسرح', 'إضاءة حديثة', 'كوشة'], 24.7136, 46.6753, '+966501234567', true, true),

('9e71d325-d25b-4f36-adde-238058c7537f', 'PLACEHOLDER_USER_ID', 'قاعة الماسة الكبرى', 'Al Masa Grand Hall', 'الرياض', 'حي الملقا، الرياض', 'قاعة فاخرة للمناسبات الكبيرة بتصميم عصري وخدمات متكاملة', 300, 400, 100, 150, 25000, 35000, 'total', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', ARRAY['موقف سيارات', 'تكييف مركزي', 'مسرح', 'كوشة', 'إضاءة ليزر'], 24.7136, 46.6753, '0501234567', true, true),

('d5cdf255-2e63-4b99-a26c-832961a73896', 'PLACEHOLDER_USER_ID', 'قاعة النجوم', 'Stars Hall', 'جدة', 'حي الحمراء، شارع التحلية', 'قاعة عصرية بتصميم حديث وإضاءة مميزة', 200, 180, 0, 0, 12000, 16000, 'total', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', ARRAY['تصميم عصري', 'نظام صوت متطور', 'شاشات عرض', 'إضاءة LED', 'مسرح'], 21.4858, 39.1925, '+966504567890', true, true),

('3d6a012c-c4dc-4bec-a6f7-8f7dcc9fd549', 'PLACEHOLDER_USER_ID', 'قاعة اللؤلؤة', 'Pearl Hall', 'جدة', 'حي الروضة، طريق الكورنيش', 'قاعة أنيقة بإطلالة بحرية ساحرة، مثالية لحفلات الزفاف الراقية', 400, 350, 0, 0, 18000, 25000, 'total', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', ARRAY['إطلالة بحرية', 'موقف سيارات VIP', 'قاعة استقبال', 'بوفيه مفتوح', 'تصوير احترافي'], 21.4858, 39.1925, '+966502345678', true, true),

('f659792e-55c0-4774-905b-06900ac356ae', 'PLACEHOLDER_USER_ID', 'قاعة الورد الأبيض', 'White Rose Hall', 'جدة', 'حي الروضة، جدة', 'قاعة أنيقة مع حديقة خارجية ساحرة', 200, 250, 80, 100, 18000, 25000, 'total', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', ARRAY['حديقة خارجية', 'مسبح', 'تكييف', 'كوشة فاخرة'], 21.4858, 39.1925, '0507654321', true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10.4: بيانات مقدمي الخدمات (SERVICE_PROVIDERS)
-- ============================================

-- ⚠️ استبدل PLACEHOLDER_USER_ID بالـ User ID الحقيقي في كل سطر
INSERT INTO public.service_providers (id, owner_id, name_ar, name_en, category_id, city, description, phone, portfolio_images, rating, reviews_count, whatsapp_enabled, is_active) VALUES
('6cb8f807-6d65-44e6-8f31-916459f445ac', 'PLACEHOLDER_USER_ID', 'ستوديو لمسات الجمال', 'Beauty Touch Studio', 'makeup', 'الرياض', 'خبرة أكثر من 10 سنوات في مكياج العرائس والمناسبات', '+966551234567', ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400'], 4.8, 156, true, true),

('52df7e68-327f-474d-8489-2d37fbe1776d', 'PLACEHOLDER_USER_ID', 'دار الأناقة', 'Elegance House', 'makeup', 'جدة', 'متخصصون في المكياج الخليجي والعالمي', '+966552345678', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400', 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400'], 4.6, 89, true, true),

('d109148d-b964-497e-9a0b-037332b67a8d', 'PLACEHOLDER_USER_ID', 'عدسة الذكريات', 'Memories Lens', 'photographer-w', 'الرياض', 'تصوير احترافي للأعراس والمناسبات مع فريق متكامل', '+966553456789', ARRAY['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'], 5.0, 1, true, true),

('d3970b0b-fd3e-4b68-8131-833f24191fd4', 'PLACEHOLDER_USER_ID', 'ستوديو النجوم', 'Stars Studio', 'photographer-w', 'الدمام', 'تصوير فوتوغرافي وفيديو بأحدث المعدات', '+966554567890', ARRAY['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400'], 4.0, 1, true, true),

('e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'PLACEHOLDER_USER_ID', 'تنسيقات الورد', 'Flower Arrangements', 'kosha', 'الرياض', 'تنسيق زهور وكوش بأفضل التصاميم العصرية', '+966556789012', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'], 5.0, 1, true, true),

('3736b2f4-37b6-427e-aca0-be9df543e07c', 'PLACEHOLDER_USER_ID', 'مطابخ الضيافة', 'Hospitality Kitchens', 'buffet', 'جدة', 'بوفيهات فاخرة للحفلات والمناسبات', '+966555678901', ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?w=400', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'], 5.0, 1, true, true),

-- مقدمي خدمات إضافيين لتغطية جميع الفئات
('a1234567-1111-1111-1111-111111111111', 'PLACEHOLDER_USER_ID', 'صالون الأميرات', 'Princess Salon', 'hair', 'الرياض', 'تسريحات شعر عصرية وكلاسيكية للعرائس', '+966550001111', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'], 4.9, 45, true, true),

('a1234567-2222-2222-2222-222222222222', 'PLACEHOLDER_USER_ID', 'فن الحناء', 'Henna Art', 'henna', 'جدة', 'رسومات حناء فنية بأحدث التصاميم', '+966550002222', ARRAY['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400'], 4.7, 32, true, true),

('a1234567-3333-3333-3333-333333333333', 'PLACEHOLDER_USER_ID', 'فرقة السعادة', 'Happiness Band', 'singer', 'الرياض', 'فرقة موسيقية للحفلات والأعراس', '+966550003333', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'], 4.8, 28, true, true),

('a1234567-4444-4444-4444-444444444444', 'PLACEHOLDER_USER_ID', 'المصور المبدع', 'Creative Photographer', 'photographer-m', 'الدمام', 'تصوير احترافي لقسم الرجال', '+966550004444', ARRAY['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400'], 4.6, 15, true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10.5: باقات الخدمات (SERVICE_PACKAGES)
-- ============================================

INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
-- باقات ستوديو لمسات الجمال (مكياج)
('f3ff7144-a77e-4adc-9aae-1664497a569c', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة العروس الأساسية', 'Basic Bridal', 'مكياج عروس كامل + تسريحة شعر', 1500),
('8d5297ab-a6ee-4fd1-b675-2cbb30acb717', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة العروس VIP', 'VIP Bridal', 'مكياج عروس + تسريحة + مكياج أم العروس + تجربة مسبقة', 2500),
('61c5485f-9254-4517-ab83-a7173b7d39b8', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة الملكة', 'Queen Package', 'مكياج عروس + 3 لوكات مختلفة + تصوير احترافي', 4000),

-- باقات دار الأناقة (مكياج)
('1fb01a48-6f4b-44ce-9546-aab3115e5205', '52df7e68-327f-474d-8489-2d37fbe1776d', 'مكياج سهرة', 'Evening Makeup', 'مكياج احترافي للمناسبات', 800),
('e93fdd10-2e41-4322-b34b-936370f201ea', '52df7e68-327f-474d-8489-2d37fbe1776d', 'باقة العروس الذهبية', 'Golden Bridal', 'مكياج عروس فاخر + تجربتين + خدمة منزلية', 3000),

-- باقات عدسة الذكريات (تصوير)
('8a81c7ed-9fd5-4365-aa45-ff9f547433b5', 'd109148d-b964-497e-9a0b-037332b67a8d', 'تغطية أساسية', 'Basic Coverage', 'تصوير 4 ساعات + 100 صورة معدلة', 3000),
('953188d4-bf21-4b76-b34f-470362f48617', 'd109148d-b964-497e-9a0b-037332b67a8d', 'تغطية شاملة', 'Full Coverage', 'تصوير 8 ساعات + 300 صورة + فيديو قصير', 6000),
('202a3165-1764-49aa-a3e1-1760b49958bc', 'd109148d-b964-497e-9a0b-037332b67a8d', 'باقة السينمائية', 'Cinematic Package', 'تصوير كامل + فيديو سينمائي + ألبوم فاخر', 12000),

-- باقات ستوديو النجوم (تصوير)
('a5693a50-9cf8-4025-afe8-3bc41a500130', 'd3970b0b-fd3e-4b68-8131-833f24191fd4', 'باقة النجمة', 'Star Package', 'تصوير 6 ساعات + 200 صورة + كليب', 4500),
('62d8090c-d19e-432b-904c-d89b966171bd', 'd3970b0b-fd3e-4b68-8131-833f24191fd4', 'باقة الذكريات', 'Memories Package', 'تغطية يومين + ألبوم + فيديو', 8000),

-- باقات مطابخ الضيافة (بوفيه)
('9821992f-765e-4317-a0c5-9142665d9d0f', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'بوفيه 100 شخص', 'Buffet 100', 'بوفيه متنوع لـ 100 شخص', 8000),
('85f600b8-f03b-4503-a79c-4f8c913b7f18', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'بوفيه 200 شخص', 'Buffet 200', 'بوفيه فاخر لـ 200 شخص + حلويات', 15000),
('20fa5c89-8253-4f1b-9179-e705e555255b', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'باقة الضيافة الملكية', 'Royal Catering', 'بوفيه ملكي + قهوة عربية + خدمة ضيافة', 25000),

-- باقات تنسيقات الورد (كوشة)
('cfeb5672-ab00-4f94-8b6a-9ab6c2981fdb', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'تنسيق كوشة', 'Kosha Setup', 'تنسيق كوشة العروس + إضاءة', 5000),
('2ba72d3c-d4e3-40ef-b014-16fc23a227bf', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'ديكور القاعة الكامل', 'Full Hall Decor', 'تنسيق كامل للقاعة + ورود + إضاءة', 15000),
('66983be0-104a-42c8-931f-bf981cf48125', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'باقة الأحلام', 'Dream Package', 'ديكور فاخر + كوشة استثنائية + ممر ورود', 30000),

-- باقات إضافية للفئات الجديدة
('b1111111-1111-1111-1111-111111111111', 'a1234567-1111-1111-1111-111111111111', 'تسريحة عروس', 'Bridal Hair', 'تسريحة شعر فاخرة للعروس', 500),
('b2222222-2222-2222-2222-222222222222', 'a1234567-2222-2222-2222-222222222222', 'حناء يدين كاملة', 'Full Hands Henna', 'رسم حناء للأيدي بالكامل', 300),
('b3333333-3333-3333-3333-333333333333', 'a1234567-3333-3333-3333-333333333333', 'فرقة 4 ساعات', '4 Hours Band', 'أداء الفرقة لمدة 4 ساعات', 5000),
('b4444444-4444-4444-4444-444444444444', 'a1234567-4444-4444-4444-444444444444', 'تصوير رجالي', 'Men Photography', 'تغطية قسم الرجال كاملة', 3500)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10.6: بيانات الفساتين (DRESSES)
-- ============================================

-- ⚠️ استبدل PLACEHOLDER_USER_ID بالـ User ID الحقيقي في كل سطر
INSERT INTO public.dresses (id, seller_id, title, description, price, size, condition, city, category, images, whatsapp_enabled, is_active, is_sold) VALUES
('c3ff9e63-aef7-4672-848a-d9a292e4db9c', 'PLACEHOLDER_USER_ID', 'فستان زفاف ملكي أبيض', 'فستان زفاف جديد لم يُلبس - تصميم إيطالي فاخر مع ذيل طويل وتطريز يدوي', 8500, 'M', 'new', 'الرياض', 'wedding', ARRAY['https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800', 'https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=800'], true, true, false),

('49e46b97-ef5e-4e24-a0b3-e9326fa94fd9', 'PLACEHOLDER_USER_ID', 'فستان سهرة أحمر فاخر', 'فستان سهرة راقي - لُبس مرة واحدة فقط - ماركة عالمية', 3200, 'L', 'used', 'جدة', 'evening', ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'], true, true, false),

('b75d95a0-21c8-4f46-8034-5088aaeac222', 'PLACEHOLDER_USER_ID', 'فستان خطوبة ذهبي', 'فستان خطوبة ذهبي أنيق - جديد بالتاج', 4500, 'S', 'new', 'الرياض', 'engagement', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], true, true, false),

('ff24fc5c-2ded-40b2-aa2b-545c51535c94', 'PLACEHOLDER_USER_ID', 'فستان زفاف كلاسيكي', 'فستان زفاف كلاسيكي رائع - لُبس مرة واحدة - مع طرحة', 6000, 'M', 'used', 'الدمام', 'wedding', ARRAY['https://images.unsplash.com/photo-1511285605577-4d62fb50d2f7?w=800'], true, true, false),

('20d60d35-b3be-4187-a006-bf770c563e62', 'PLACEHOLDER_USER_ID', 'فستان سهرة أسود', 'فستان سهرة أسود طويل - تصميم عصري أنيق', 2800, 'XL', 'new', 'مكة المكرمة', 'evening', ARRAY['https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800'], true, true, false),

('ab11583b-3595-46e8-9d5c-65e85496477d', 'PLACEHOLDER_USER_ID', 'فستان خطوبة وردي', 'فستان خطوبة وردي ناعم مع تطريز لؤلؤ', 3800, 'S', 'new', 'جدة', 'engagement', ARRAY['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'], true, true, false),

('22f3a6db-08fb-49bc-8470-389f56db67be', 'PLACEHOLDER_USER_ID', 'فستان زفاف عصري', 'فستان زفاف من تصميم مصمم عالمي - قطعة فريدة', 12000, 'M', 'new', 'الرياض', 'wedding', ARRAY['https://images.unsplash.com/photo-1549416878-879c6a88e6b1?w=800', 'https://images.unsplash.com/photo-1522069213448-443a614da9b6?w=800'], true, true, false),

('c34a4a4c-44f3-49f4-a867-565fbf0d274d', 'PLACEHOLDER_USER_ID', 'فستان سهرة أزرق', 'فستان سهرة أزرق ملكي - حالة ممتازة', 2500, 'L', 'used', 'المدينة المنورة', 'evening', ARRAY['https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800'], true, true, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10.7: بيانات توفر القاعات (30 يوم)
-- ============================================

-- إنشاء توفر للقاعات لمدة 30 يوم من اليوم
INSERT INTO public.hall_availability (hall_id, date, status)
SELECT 
  h.id,
  CURRENT_DATE + i,
  CASE 
    WHEN random() < 0.1 THEN 'booked'::availability_status
    WHEN random() < 0.15 THEN 'resale'::availability_status
    ELSE 'available'::availability_status
  END
FROM public.halls h
CROSS JOIN generate_series(0, 30) AS i
ON CONFLICT (hall_id, date) DO NOTHING;

-- ============================================
-- 10.8: بيانات توفر مقدمي الخدمات (30 يوم)
-- ============================================

-- إنشاء توفر لمقدمي الخدمات لمدة 30 يوم من اليوم
INSERT INTO public.service_provider_availability (provider_id, date, status)
SELECT 
  sp.id,
  CURRENT_DATE + i,
  CASE 
    WHEN random() < 0.15 THEN 'booked'::service_availability_status
    ELSE 'available'::service_availability_status
  END
FROM public.service_providers sp
CROSS JOIN generate_series(0, 30) AS i
ON CONFLICT (provider_id, date) DO NOTHING;

-- ============================================
-- نهاية التصدير الكامل
-- ============================================

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║                         ✅ تم بنجاح!                               ║
-- ╠════════════════════════════════════════════════════════════════════╣
-- ║                                                                    ║
-- ║  إذا رأيت هذه الرسالة بدون أخطاء، فقد تم استيراد:                 ║
-- ║                                                                    ║
-- ║  ✓ جميع الجداول والـ Types                                        ║
-- ║  ✓ جميع الـ Functions والـ Triggers                                ║
-- ║  ✓ جميع سياسات الأمان (RLS)                                       ║
-- ║  ✓ Storage Buckets والـ Policies                                   ║
-- ║  ✓ البيانات التجريبية                                              ║
-- ║                                                                    ║
-- ║  الخطوة التالية:                                                   ║
-- ║  → اربط تطبيقك بـ Supabase الجديد عبر .env                        ║
-- ║                                                                    ║
-- ╚════════════════════════════════════════════════════════════════════╝
