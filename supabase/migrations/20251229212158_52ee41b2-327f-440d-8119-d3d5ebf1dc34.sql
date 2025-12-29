-- Create enum for vendor roles
CREATE TYPE public.vendor_role AS ENUM ('hall_owner', 'service_provider', 'dress_seller');

-- Create enum for vendor status
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Create enum for availability status
CREATE TYPE public.availability_status AS ENUM ('available', 'booked', 'resale');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_applications table for admin approval flow
CREATE TABLE public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role vendor_role NOT NULL,
  status vendor_status DEFAULT 'pending',
  business_name TEXT NOT NULL,
  business_description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

-- Create halls table for hall owners
CREATE TABLE public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  price_weekday INTEGER NOT NULL,
  price_weekend INTEGER NOT NULL,
  capacity_men INTEGER NOT NULL,
  capacity_women INTEGER NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cover_image TEXT,
  gallery_images TEXT[],
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hall_availability for calendar management
CREATE TABLE public.hall_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status availability_status DEFAULT 'available',
  resale_discount INTEGER,
  notes TEXT,
  UNIQUE(hall_id, date)
);

-- Create hall_bookings for booking requests
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  portfolio_images TEXT[],
  work_days TEXT[],
  city TEXT NOT NULL,
  phone TEXT,
  whatsapp_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_packages for pricing tiers
CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dresses table for C2C marketplace
CREATE TABLE public.dresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  size TEXT NOT NULL,
  condition TEXT DEFAULT 'used',
  city TEXT NOT NULL,
  images TEXT[],
  whatsapp_enabled BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vendor applications RLS
CREATE POLICY "Users can view own applications" ON public.vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON public.vendor_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Halls RLS policies
CREATE POLICY "Halls are viewable by everyone" ON public.halls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own halls" ON public.halls
  FOR ALL USING (auth.uid() = owner_id);

-- Hall availability RLS
CREATE POLICY "Hall availability is public" ON public.hall_availability
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage hall availability" ON public.hall_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.halls 
      WHERE halls.id = hall_availability.hall_id 
      AND halls.owner_id = auth.uid()
    )
  );

-- Hall bookings RLS
CREATE POLICY "Users can view own bookings" ON public.hall_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hall owners can view their bookings" ON public.hall_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.halls 
      WHERE halls.id = hall_bookings.hall_id 
      AND halls.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON public.hall_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hall owners can update bookings" ON public.hall_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.halls 
      WHERE halls.id = hall_bookings.hall_id 
      AND halls.owner_id = auth.uid()
    )
  );

-- Service providers RLS
CREATE POLICY "Service providers are viewable by everyone" ON public.service_providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own services" ON public.service_providers
  FOR ALL USING (auth.uid() = owner_id);

-- Service packages RLS
CREATE POLICY "Packages are viewable by everyone" ON public.service_packages
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage own packages" ON public.service_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.service_providers 
      WHERE service_providers.id = service_packages.provider_id 
      AND service_providers.owner_id = auth.uid()
    )
  );

-- Dresses RLS
CREATE POLICY "Active dresses are viewable by everyone" ON public.dresses
  FOR SELECT USING (is_active = true AND is_sold = false);

CREATE POLICY "Sellers can view own dresses" ON public.dresses
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can manage own dresses" ON public.dresses
  FOR ALL USING (auth.uid() = seller_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_halls_updated_at
  BEFORE UPDATE ON public.halls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hall_bookings_updated_at
  BEFORE UPDATE ON public.hall_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dresses_updated_at
  BEFORE UPDATE ON public.dresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.hall_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hall_availability;