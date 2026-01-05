-- Create favorites for service providers
CREATE TABLE public.service_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Create favorites for dresses
CREATE TABLE public.dress_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, dress_id)
);

-- Enable RLS on service_favorites
ALTER TABLE public.service_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_favorites
CREATE POLICY "Users can view own service favorites"
ON public.service_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own service favorites"
ON public.service_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own service favorites"
ON public.service_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on dress_favorites
ALTER TABLE public.dress_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for dress_favorites
CREATE POLICY "Users can view own dress favorites"
ON public.dress_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dress favorites"
ON public.dress_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dress favorites"
ON public.dress_favorites
FOR DELETE
USING (auth.uid() = user_id);