-- =============================================
-- ملف البيانات التجريبية لمشروع زفاف
-- Demo Data File for Zafaf Project
-- تاريخ التصدير: 2026-02-09
-- =============================================

-- =============================================
-- ⚠️ تعليمات مهمة قبل التنفيذ
-- =============================================
-- 1. أنشئ المستخدمين في Authentication → Users
-- 2. استبدل المتغيرات التالية بالمعرفات الفعلية:
--    - ADMIN_USER_ID → معرف المدير
--    - HALL_OWNER_USER_ID → معرف صاحب القاعات
--    - SERVICE_PROVIDER_USER_ID → معرف مقدم الخدمات
--    - DRESS_SELLER_USER_ID → معرف بائع الفساتين
--    - CUSTOMER_USER_ID → معرف العميل
-- 3. نفذ الملف في SQL Editor بعد الاستبدال
-- =============================================

-- =============================================
-- الجزء 1: الملفات الشخصية (Profiles)
-- =============================================

INSERT INTO public.profiles (id, full_name, phone, city, onboarding_completed) VALUES
('ADMIN_USER_ID', 'مدير النظام', '0500000001', 'الرياض', true),
('HALL_OWNER_USER_ID', 'محمد العتيبي', '0500000002', 'الرياض', true),
('SERVICE_PROVIDER_USER_ID', 'فاطمة الأحمد', '0500000003', 'جدة', true),
('DRESS_SELLER_USER_ID', 'نورة السعيد', '0500000004', 'الرياض', true),
('CUSTOMER_USER_ID', 'سارة المحمد', '0500000005', 'جدة', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  city = EXCLUDED.city,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- =============================================
-- الجزء 2: الأدوار (User Roles)
-- =============================================

INSERT INTO public.user_roles (user_id, role) VALUES
('ADMIN_USER_ID', 'admin'),
('HALL_OWNER_USER_ID', 'hall_owner'),
('SERVICE_PROVIDER_USER_ID', 'service_provider'),
('DRESS_SELLER_USER_ID', 'dress_seller'),
('CUSTOMER_USER_ID', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- الجزء 3: القاعات (Halls)
-- =============================================

INSERT INTO public.halls (id, owner_id, name_ar, name_en, description, city, address, price_weekday, price_weekend, capacity_men, capacity_women, min_capacity_men, min_capacity_women, features, is_active, whatsapp_enabled) VALUES
('11111111-1111-1111-1111-111111111111', 'HALL_OWNER_USER_ID', 'قاعة الماسة الذهبية', 'Golden Diamond Hall', 'قاعة فاخرة تتسع لأكثر من 500 ضيف مع خدمات متكاملة وديكورات راقية', 'الرياض', 'حي الملقا، شارع الأمير محمد بن عبدالعزيز', 25000, 35000, 250, 300, 100, 100, ARRAY['مواقف سيارات', 'قسم رجال منفصل', 'قسم نساء منفصل', 'بوفيه مفتوح', 'إضاءة ملونة', 'شاشات عرض', 'نظام صوتي متكامل', 'غرفة عروس'], true, true),

('22222222-2222-2222-2222-222222222222', 'HALL_OWNER_USER_ID', 'قاعة النجوم الساطعة', 'Bright Stars Hall', 'قاعة حديثة بتصميم عصري وإطلالة مميزة على الحديقة', 'الرياض', 'حي النرجس، طريق الملك سلمان', 18000, 25000, 150, 200, 50, 50, ARRAY['مواقف سيارات', 'حديقة خارجية', 'شلالات مائية', 'منطقة استقبال', 'تكييف مركزي', 'واي فاي'], true, true),

('33333333-3333-3333-3333-333333333333', 'HALL_OWNER_USER_ID', 'قاعة اللؤلؤة البحرية', 'Pearl Hall', 'قاعة أنيقة بديكورات بحرية ساحرة', 'جدة', 'حي الشاطئ، كورنيش جدة', 30000, 45000, 200, 250, 80, 80, ARRAY['إطلالة بحرية', 'تراس خارجي', 'بوفيه فاخر', 'خدمة ضيافة', 'كوشة فاخرة', 'تصوير احترافي'], true, true),

('44444444-4444-4444-4444-444444444444', 'HALL_OWNER_USER_ID', 'قاعة الورد الأبيض', 'White Rose Hall', 'قاعة رومانسية بديكورات ورود طبيعية', 'جدة', 'حي الروضة، شارع فلسطين', 22000, 32000, 180, 220, 60, 60, ARRAY['ورود طبيعية', 'إضاءة رومانسية', 'موسيقى حية', 'كوشة مميزة', 'غرفة تجهيز'], true, true),

('55555555-5555-5555-5555-555555555555', 'HALL_OWNER_USER_ID', 'قاعة القصر الملكي', 'Royal Palace Hall', 'قاعة ملكية فاخرة بتصميم كلاسيكي راقي', 'الدمام', 'حي الشاطئ الغربي', 40000, 55000, 300, 400, 150, 150, ARRAY['تصميم ملكي', 'ثريات كريستال', 'سجاد فاخر', 'خدمة VIP', 'مدخل خاص للعروس', 'غرف استراحة'], true, true);

-- =============================================
-- الجزء 4: توفر القاعات (Hall Availability) - 30 يوم
-- =============================================

DO $$
DECLARE
    hall_ids UUID[] := ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555'];
    hall_id UUID;
    current_date DATE := CURRENT_DATE;
    i INTEGER;
BEGIN
    FOREACH hall_id IN ARRAY hall_ids LOOP
        FOR i IN 0..29 LOOP
            INSERT INTO public.hall_availability (hall_id, date, status)
            VALUES (hall_id, current_date + i, 'available')
            ON CONFLICT (hall_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- =============================================
-- الجزء 5: مقدمو الخدمات (Service Providers)
-- =============================================

-- مصورين
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'photographer-w', 'عدسة الذكريات', 'Memories Lens', 'تصوير احترافي للأعراس والمناسبات مع أحدث المعدات', 'الرياض', '0512345678', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true),

('aaaa2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'photographer-w', 'ستوديو النجوم', 'Stars Studio', 'تصوير فوتوغرافي وفيديو بجودة عالية', 'جدة', '0523456789', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'], true, true)
ON CONFLICT (id) DO NOTHING;

-- مكياج
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('bbbb1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'makeup', 'ستوديو لمسات الجمال', 'Beauty Touch Studio', 'خبيرة مكياج عرائس ومناسبات مع أفضل الماركات العالمية', 'الرياض', '0534567890', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], true, true),

('bbbb2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'makeup', 'دار الأناقة', 'Elegance House', 'مكياج احترافي للعرائس والسهرات', 'جدة', '0545678901', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true)
ON CONFLICT (id) DO NOTHING;

-- تسريحات شعر
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('cccc1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'hair', 'صالون الأميرات', 'Princesses Salon', 'تسريحات شعر عصرية وكلاسيكية للعرائس', 'الرياض', '0556789012', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true),

('cccc2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'hair', 'لمسة جمال', 'Beauty Touch', 'متخصصات في تسريحات العرائس', 'جدة', '0567890123', ARRAY['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true)
ON CONFLICT (id) DO NOTHING;

-- حناء
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('dddd1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'henna', 'حنة أم فهد', 'Um Fahad Henna', 'نقوش حناء خليجية وهندية رائعة', 'الرياض', '0578901234', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], true, true),

('dddd2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'henna', 'حناء الجوهرة', 'Aljawharah Henna', 'حناء سودانية وخليجية بأحدث التصاميم', 'جدة', '0589012345', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true)
ON CONFLICT (id) DO NOTHING;

-- كوشات وتنسيق
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('eeee1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'kosha', 'تنسيقات الورد', 'Rose Arrangements', 'كوشات وتنسيق قاعات بأرقى التصاميم', 'الرياض', '0590123456', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true),

('eeee2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'kosha', 'لمسات إبداعية', 'Creative Touches', 'تصميم كوشات فريدة ومميزة', 'جدة', '0501234567', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], true, true)
ON CONFLICT (id) DO NOTHING;

-- بوفيه وضيافة
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('ffff1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'buffet', 'مطابخ الضيافة', 'Hospitality Kitchens', 'بوفيهات فاخرة وضيافة راقية للمناسبات', 'الرياض', '0512345001', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], true, true),

('ffff2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'buffet', 'نكهات العرس', 'Wedding Flavors', 'تقديم أشهى المأكولات للأعراس', 'جدة', '0523456002', ARRAY['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], true, true)
ON CONFLICT (id) DO NOTHING;

-- مغنيات
INSERT INTO public.service_providers (id, owner_id, category_id, name_ar, name_en, description, city, phone, work_days, is_active, whatsapp_enabled) VALUES
('gggg1111-1111-1111-1111-111111111111', 'SERVICE_PROVIDER_USER_ID', 'singer', 'فرقة الأفراح', 'Wedding Band', 'فرقة موسيقية متخصصة في الأعراس', 'الرياض', '0534567003', ARRAY['الخميس', 'الجمعة', 'السبت'], true, true),

('gggg2222-2222-2222-2222-222222222222', 'SERVICE_PROVIDER_USER_ID', 'singer', 'نغمات السعادة', 'Happiness Tunes', 'إحياء حفلات الأعراس بأجمل الأغاني', 'جدة', '0545678004', ARRAY['الخميس', 'الجمعة', 'السبت'], true, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- الجزء 6: باقات الخدمات (Service Packages)
-- =============================================

-- باقات المصورين
INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('pkg-photo-001', 'aaaa1111-1111-1111-1111-111111111111', 'الباقة الأساسية', 'Basic Package', 'تغطية 4 ساعات + 100 صورة معدلة', 3000),
('pkg-photo-002', 'aaaa1111-1111-1111-1111-111111111111', 'الباقة الفضية', 'Silver Package', 'تغطية 6 ساعات + 200 صورة معدلة + فيديو قصير', 5000),
('pkg-photo-003', 'aaaa1111-1111-1111-1111-111111111111', 'الباقة الذهبية', 'Gold Package', 'تغطية كاملة + 300 صورة + فيديو سينمائي', 8000),
('pkg-photo-004', 'aaaa2222-2222-2222-2222-222222222222', 'باقة ستوديو النجوم', 'Stars Package', 'تغطية كاملة مع طاقم متكامل', 7000)
ON CONFLICT (id) DO NOTHING;

-- باقات المكياج
INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('pkg-makeup-001', 'bbbb1111-1111-1111-1111-111111111111', 'مكياج العروس', 'Bridal Makeup', 'مكياج كامل للعروس مع تثبيت', 2500),
('pkg-makeup-002', 'bbbb1111-1111-1111-1111-111111111111', 'مكياج سهرة', 'Evening Makeup', 'مكياج سهرة راقي', 1500),
('pkg-makeup-003', 'bbbb2222-2222-2222-2222-222222222222', 'باقة الأناقة الكاملة', 'Full Elegance', 'مكياج + تسريحة + مانيكير', 4000)
ON CONFLICT (id) DO NOTHING;

-- باقات الحناء
INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('pkg-henna-001', 'dddd1111-1111-1111-1111-111111111111', 'حناء اليدين', 'Hands Henna', 'نقش حناء لليدين الأمامية والخلفية', 800),
('pkg-henna-002', 'dddd1111-1111-1111-1111-111111111111', 'حناء كاملة', 'Full Henna', 'نقش اليدين والقدمين كاملة', 1500),
('pkg-henna-003', 'dddd2222-2222-2222-2222-222222222222', 'حناء سودانية', 'Sudanese Henna', 'حناء سودانية أصلية', 1200)
ON CONFLICT (id) DO NOTHING;

-- باقات الكوشات
INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('pkg-kosha-001', 'eeee1111-1111-1111-1111-111111111111', 'كوشة كلاسيكية', 'Classic Kosha', 'كوشة بتصميم كلاسيكي راقي', 5000),
('pkg-kosha-002', 'eeee1111-1111-1111-1111-111111111111', 'كوشة ملكية', 'Royal Kosha', 'كوشة فاخرة بتصميم ملكي', 10000),
('pkg-kosha-003', 'eeee2222-2222-2222-2222-222222222222', 'تنسيق كامل', 'Full Decoration', 'تنسيق القاعة كاملة مع الكوشة', 15000)
ON CONFLICT (id) DO NOTHING;

-- باقات البوفيه
INSERT INTO public.service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('pkg-buffet-001', 'ffff1111-1111-1111-1111-111111111111', 'بوفيه 100 شخص', '100 Person Buffet', 'بوفيه متكامل لـ 100 شخص', 8000),
('pkg-buffet-002', 'ffff1111-1111-1111-1111-111111111111', 'بوفيه 200 شخص', '200 Person Buffet', 'بوفيه فاخر لـ 200 شخص', 15000),
('pkg-buffet-003', 'ffff2222-2222-2222-2222-222222222222', 'ضيافة VIP', 'VIP Catering', 'ضيافة راقية مع طاقم خدمة', 20000)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- الجزء 7: توفر مقدمي الخدمات (30 يوم)
-- =============================================

DO $$
DECLARE
    provider_ids UUID[] := ARRAY[
        'aaaa1111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222',
        'bbbb1111-1111-1111-1111-111111111111', 'bbbb2222-2222-2222-2222-222222222222',
        'cccc1111-1111-1111-1111-111111111111', 'cccc2222-2222-2222-2222-222222222222',
        'dddd1111-1111-1111-1111-111111111111', 'dddd2222-2222-2222-2222-222222222222',
        'eeee1111-1111-1111-1111-111111111111', 'eeee2222-2222-2222-2222-222222222222',
        'ffff1111-1111-1111-1111-111111111111', 'ffff2222-2222-2222-2222-222222222222',
        'gggg1111-1111-1111-1111-111111111111', 'gggg2222-2222-2222-2222-222222222222'
    ];
    provider_id UUID;
    current_date DATE := CURRENT_DATE;
    i INTEGER;
BEGIN
    FOREACH provider_id IN ARRAY provider_ids LOOP
        FOR i IN 0..29 LOOP
            INSERT INTO public.service_provider_availability (provider_id, date, status)
            VALUES (provider_id, current_date + i, 'available')
            ON CONFLICT (provider_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- =============================================
-- الجزء 8: الفساتين (Dresses)
-- =============================================

INSERT INTO public.dresses (id, seller_id, title, description, price, size, condition, category, city, is_active, is_sold, whatsapp_enabled) VALUES
('dress-001', 'DRESS_SELLER_USER_ID', 'فستان زفاف ملكي أبيض', 'فستان زفاف أبيض فاخر بذيل طويل وتطريز يدوي، ارتداء مرة واحدة فقط', 8000, 'M', 'like_new', 'wedding', 'الرياض', true, false, true),

('dress-002', 'DRESS_SELLER_USER_ID', 'فستان سهرة أحمر فاخر', 'فستان سهرة أحمر أنيق مناسب للحفلات والمناسبات', 3500, 'S', 'like_new', 'evening', 'جدة', true, false, true),

('dress-003', 'DRESS_SELLER_USER_ID', 'فستان خطوبة ذهبي', 'فستان خطوبة ذهبي لامع بتصميم عصري', 4500, 'M', 'used', 'engagement', 'الرياض', true, false, true),

('dress-004', 'DRESS_SELLER_USER_ID', 'فستان زفاف كلاسيكي', 'فستان زفاف بتصميم كلاسيكي راقي مع طرحة', 6000, 'L', 'used', 'wedding', 'الدمام', true, false, true),

('dress-005', 'DRESS_SELLER_USER_ID', 'فستان سهرة أسود', 'فستان سهرة أسود أنيق للمناسبات الرسمية', 2500, 'XS', 'like_new', 'evening', 'مكة المكرمة', true, false, true),

('dress-006', 'DRESS_SELLER_USER_ID', 'فستان زفاف دانتيل', 'فستان زفاف دانتيل فرنسي فاخر', 12000, 'M', 'new', 'wedding', 'الرياض', true, false, true),

('dress-007', 'DRESS_SELLER_USER_ID', 'فستان خطوبة وردي', 'فستان خطوبة وردي فاتح بتفاصيل جميلة', 3000, 'S', 'like_new', 'engagement', 'جدة', true, false, true),

('dress-008', 'DRESS_SELLER_USER_ID', 'فستان سهرة أزرق ملكي', 'فستان سهرة أزرق ملكي بقصة أنيقة', 4000, 'L', 'used', 'evening', 'الرياض', true, false, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- الجزء 9: تقييمات القاعات (Hall Reviews)
-- =============================================

INSERT INTO public.hall_reviews (id, hall_id, user_id, rating, comment) VALUES
('review-hall-001', '11111111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 5, 'قاعة رائعة جداً! الخدمة ممتازة والديكورات فخمة. أنصح بها بشدة'),
('review-hall-002', '22222222-2222-2222-2222-222222222222', 'CUSTOMER_USER_ID', 4, 'قاعة جميلة ونظيفة، الموظفين متعاونين'),
('review-hall-003', '33333333-3333-3333-3333-333333333333', 'CUSTOMER_USER_ID', 5, 'إطلالة بحرية ساحرة! من أجمل القاعات التي زرتها'),
('review-hall-004', '44444444-4444-4444-4444-444444444444', 'CUSTOMER_USER_ID', 4, 'قاعة رومانسية وجميلة، الورود كانت طازجة'),
('review-hall-005', '55555555-5555-5555-5555-555555555555', 'CUSTOMER_USER_ID', 5, 'قاعة ملكية بمعنى الكلمة! فخامة لا توصف')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- الجزء 10: تقييمات مقدمي الخدمات
-- =============================================

INSERT INTO public.service_provider_reviews (id, provider_id, user_id, rating, comment) VALUES
('review-sp-001', 'aaaa1111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 5, 'مصور محترف جداً! الصور طلعت روعة'),
('review-sp-002', 'bbbb1111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 5, 'مكياج رائع ويثبت طول اليوم'),
('review-sp-003', 'dddd1111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 4, 'نقوش حناء جميلة ومتقنة'),
('review-sp-004', 'eeee1111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 5, 'كوشة خيالية! تجاوزت توقعاتي'),
('review-sp-005', 'ffff1111-1111-1111-1111-111111111111', 'CUSTOMER_USER_ID', 4, 'أكل لذيذ والضيوف أثنوا عليه')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- الجزء 11: الإعلانات (Advertisements)
-- =============================================

INSERT INTO public.advertisements (id, title, image_url, link_url, position, is_active, start_date, end_date) VALUES
('ad-001', 'خصم 20% على القاعات', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', null, 'home', true, CURRENT_DATE, CURRENT_DATE + 30),
('ad-002', 'عروض الصيف للفساتين', 'https://images.unsplash.com/photo-1594552072238-5c54fc95a996?w=800', null, 'dresses', true, CURRENT_DATE, CURRENT_DATE + 30),
('ad-003', 'مصورين محترفين', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', null, 'services', true, CURRENT_DATE, CURRENT_DATE + 30)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ✅ نهاية ملف البيانات التجريبية
-- =============================================

-- ملخص البيانات المضافة:
-- ✓ 5 ملفات شخصية (مدير، صاحب قاعات، مقدم خدمات، بائع فساتين، عميل)
-- ✓ 5 أدوار مستخدمين
-- ✓ 5 قاعات مع توفر 30 يوم
-- ✓ 14 مقدم خدمة (مصورين، مكياج، شعر، حناء، كوشات، بوفيه، مغنيات)
-- ✓ 15 باقة خدمات
-- ✓ 8 فساتين للبيع
-- ✓ 5 تقييمات قاعات
-- ✓ 5 تقييمات خدمات
-- ✓ 3 إعلانات
