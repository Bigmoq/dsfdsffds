-- Performance indexes for high-concurrency (1000+ users)

-- Hall bookings indexes (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_hall_bookings_user_id ON public.hall_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hall_bookings_hall_id ON public.hall_bookings(hall_id);
CREATE INDEX IF NOT EXISTS idx_hall_bookings_booking_date ON public.hall_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_hall_bookings_status ON public.hall_bookings(status);
CREATE INDEX IF NOT EXISTS idx_hall_bookings_hall_status ON public.hall_bookings(hall_id, status);

-- Service bookings indexes
CREATE INDEX IF NOT EXISTS idx_service_bookings_user_id ON public.service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_date ON public.service_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);

-- Halls indexes
CREATE INDEX IF NOT EXISTS idx_halls_owner_id ON public.halls(owner_id);
CREATE INDEX IF NOT EXISTS idx_halls_city ON public.halls(city);
CREATE INDEX IF NOT EXISTS idx_halls_is_active ON public.halls(is_active);

-- Service providers indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_owner_id ON public.service_providers(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON public.service_providers(city);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON public.service_providers(is_active);

-- Dresses indexes
CREATE INDEX IF NOT EXISTS idx_dresses_seller_id ON public.dresses(seller_id);
CREATE INDEX IF NOT EXISTS idx_dresses_city ON public.dresses(city);
CREATE INDEX IF NOT EXISTS idx_dresses_is_active ON public.dresses(is_active);

-- Notifications indexes (critical for realtime)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_dress_favorites_user_id ON public.dress_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_user_id ON public.service_favorites(user_id);

-- Hall availability indexes
CREATE INDEX IF NOT EXISTS idx_hall_availability_hall_id ON public.hall_availability(hall_id);
CREATE INDEX IF NOT EXISTS idx_hall_availability_date ON public.hall_availability(date);

-- Service provider availability indexes  
CREATE INDEX IF NOT EXISTS idx_service_availability_provider_id ON public.service_provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_availability_date ON public.service_provider_availability(date);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_hall_reviews_hall_id ON public.hall_reviews(hall_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_provider_id ON public.service_provider_reviews(provider_id);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);