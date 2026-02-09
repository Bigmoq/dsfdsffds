-- ============================================
-- تصدير بيانات تطبيق زفاف
-- تاريخ التصدير: 2026-02-09
-- ============================================

-- ⚠️ ملاحظة مهمة:
-- 1. تأكد من إنشاء جميع الجداول والـ types أولاً (الـ schema)
-- 2. قم بتعديل owner_id و seller_id و user_id لتتوافق مع المستخدمين في Supabase الجديد
-- 3. الـ profiles مرتبطة بـ auth.users - ستحتاج إنشاء المستخدمين أولاً

-- ============================================
-- 1. HALLS (القاعات)
-- ============================================

INSERT INTO halls (id, owner_id, name_ar, name_en, city, address, description, capacity_men, capacity_women, min_capacity_men, min_capacity_women, price_weekday, price_weekend, pricing_type, cover_image, features, latitude, longitude, phone, whatsapp_enabled, is_active) VALUES
('1119b8fa-f67e-4cea-a01a-46b9958246fa', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'قاعة الماسة الذهبية', 'Golden Diamond Hall', 'الرياض', 'حي النخيل، شارع الملك فهد', 'قاعة فاخرة للمناسبات والأفراح، تتميز بديكورات راقية وخدمات متكاملة', 300, 250, 0, 0, 15000, 20000, 'total', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', ARRAY['موقف سيارات', 'تكييف مركزي', 'مسرح', 'إضاءة حديثة', 'كوشة'], 24.7136, 46.6753, '+966501234567', true, true),

('9e71d325-d25b-4f36-adde-238058c7537f', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'قاعة الماسة الكبرى', 'Al Masa Grand Hall', 'الرياض', 'حي الملقا، الرياض', 'قاعة فاخرة للمناسبات الكبيرة بتصميم عصري وخدمات متكاملة', 300, 400, 100, 150, 25000, 35000, 'total', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', ARRAY['موقف سيارات', 'تكييف مركزي', 'مسرح', 'كوشة', 'إضاءة ليزر'], 24.7136, 46.6753, '0501234567', true, true),

('d5cdf255-2e63-4b99-a26c-832961a73896', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'قاعة النجوم', 'Stars Hall', 'جدة', 'حي الحمراء، شارع التحلية', 'قاعة عصرية بتصميم حديث وإضاءة مميزة', 200, 180, 0, 0, 12000, 16000, 'total', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', ARRAY['تصميم عصري', 'نظام صوت متطور', 'شاشات عرض', 'إضاءة LED', 'مسرح'], 21.4858, 39.1925, '+966504567890', true, true),

('3d6a012c-c4dc-4bec-a6f7-8f7dcc9fd549', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'قاعة اللؤلؤة', 'Pearl Hall', 'جدة', 'حي الروضة، طريق الكورنيش', 'قاعة أنيقة بإطلالة بحرية ساحرة، مثالية لحفلات الزفاف الراقية', 400, 350, 0, 0, 18000, 25000, 'total', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', ARRAY['إطلالة بحرية', 'موقف سيارات VIP', 'قاعة استقبال', 'بوفيه مفتوح', 'تصوير احترافي'], 21.4858, 39.1925, '+966502345678', true, false),

('f659792e-55c0-4774-905b-06900ac356ae', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'قاعة الورد الأبيض', 'White Rose Hall', 'جدة', 'حي الروضة، جدة', 'قاعة أنيقة مع حديقة خارجية ساحرة', 200, 250, 80, 100, 18000, 25000, 'total', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', ARRAY['حديقة خارجية', 'مسبح', 'تكييف', 'كوشة فاخرة'], 21.4858, 39.1925, '0507654321', true, true);

-- ============================================
-- 2. SERVICE_PROVIDERS (مقدمي الخدمات)
-- ============================================

INSERT INTO service_providers (id, owner_id, name_ar, name_en, category_id, city, description, phone, portfolio_images, rating, reviews_count, whatsapp_enabled, is_active) VALUES
('6cb8f807-6d65-44e6-8f31-916459f445ac', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'ستوديو لمسات الجمال', 'Beauty Touch Studio', 'makeup', 'الرياض', 'خبرة أكثر من 10 سنوات في مكياج العرائس والمناسبات', '+966551234567', ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400'], 4.8, 156, true, true),

('52df7e68-327f-474d-8489-2d37fbe1776d', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'دار الأناقة', 'Elegance House', 'makeup', 'جدة', 'متخصصون في المكياج الخليجي والعالمي', '+966552345678', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400', 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400'], 4.6, 89, true, true),

('d109148d-b964-497e-9a0b-037332b67a8d', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'عدسة الذكريات', 'Memories Lens', 'photographer-w', 'الرياض', 'تصوير احترافي للأعراس والمناسبات مع فريق متكامل', '+966553456789', ARRAY['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'], 5.0, 1, true, true),

('d3970b0b-fd3e-4b68-8131-833f24191fd4', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'ستوديو النجوم', 'Stars Studio', 'photographer-w', 'الدمام', 'تصوير فوتوغرافي وفيديو بأحدث المعدات', '+966554567890', ARRAY['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400'], 4.0, 1, true, true),

('e6b165de-4c3c-4826-a1f8-c400d61d3d9b', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'تنسيقات الورد', 'Flower Arrangements', 'kosha', 'الرياض', 'تنسيق زهور وكوش بأفضل التصاميم العصرية', '+966556789012', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'], 5.0, 1, true, true),

('3736b2f4-37b6-427e-aca0-be9df543e07c', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'مطابخ الضيافة', 'Hospitality Kitchens', 'buffet', 'جدة', 'بوفيهات فاخرة للحفلات والمناسبات', '+966555678901', ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?w=400', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'], 5.0, 1, true, true);

-- ============================================
-- 3. SERVICE_PACKAGES (باقات الخدمات)
-- ============================================

INSERT INTO service_packages (id, provider_id, name_ar, name_en, description, price) VALUES
('f3ff7144-a77e-4adc-9aae-1664497a569c', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة العروس الأساسية', 'Basic Bridal', 'مكياج عروس كامل + تسريحة شعر', 1500),
('8d5297ab-a6ee-4fd1-b675-2cbb30acb717', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة العروس VIP', 'VIP Bridal', 'مكياج عروس + تسريحة + مكياج أم العروس + تجربة مسبقة', 2500),
('61c5485f-9254-4517-ab83-a7173b7d39b8', '6cb8f807-6d65-44e6-8f31-916459f445ac', 'باقة الملكة', 'Queen Package', 'مكياج عروس + 3 لوكات مختلفة + تصوير احترافي', 4000),
('1fb01a48-6f4b-44ce-9546-aab3115e5205', '52df7e68-327f-474d-8489-2d37fbe1776d', 'مكياج سهرة', 'Evening Makeup', 'مكياج احترافي للمناسبات', 800),
('e93fdd10-2e41-4322-b34b-936370f201ea', '52df7e68-327f-474d-8489-2d37fbe1776d', 'باقة العروس الذهبية', 'Golden Bridal', 'مكياج عروس فاخر + تجربتين + خدمة منزلية', 3000),
('8a81c7ed-9fd5-4365-aa45-ff9f547433b5', 'd109148d-b964-497e-9a0b-037332b67a8d', 'تغطية أساسية', 'Basic Coverage', 'تصوير 4 ساعات + 100 صورة معدلة', 3000),
('953188d4-bf21-4b76-b34f-470362f48617', 'd109148d-b964-497e-9a0b-037332b67a8d', 'تغطية شاملة', 'Full Coverage', 'تصوير 8 ساعات + 300 صورة + فيديو قصير', 6000),
('202a3165-1764-49aa-a3e1-1760b49958bc', 'd109148d-b964-497e-9a0b-037332b67a8d', 'باقة السينمائية', 'Cinematic Package', 'تصوير كامل + فيديو سينمائي + ألبوم فاخر', 12000),
('a5693a50-9cf8-4025-afe8-3bc41a500130', 'd3970b0b-fd3e-4b68-8131-833f24191fd4', 'باقة النجمة', 'Star Package', 'تصوير 6 ساعات + 200 صورة + كليب', 4500),
('62d8090c-d19e-432b-904c-d89b966171bd', 'd3970b0b-fd3e-4b68-8131-833f24191fd4', 'باقة الذكريات', 'Memories Package', 'تغطية يومين + ألبوم + فيديو', 8000),
('9821992f-765e-4317-a0c5-9142665d9d0f', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'بوفيه 100 شخص', 'Buffet 100', 'بوفيه متنوع لـ 100 شخص', 8000),
('85f600b8-f03b-4503-a79c-4f8c913b7f18', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'بوفيه 200 شخص', 'Buffet 200', 'بوفيه فاخر لـ 200 شخص + حلويات', 15000),
('20fa5c89-8253-4f1b-9179-e705e555255b', '3736b2f4-37b6-427e-aca0-be9df543e07c', 'باقة الضيافة الملكية', 'Royal Catering', 'بوفيه ملكي + قهوة عربية + خدمة ضيافة', 25000),
('cfeb5672-ab00-4f94-8b6a-9ab6c2981fdb', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'تنسيق كوشة', 'Kosha Setup', 'تنسيق كوشة العروس + إضاءة', 5000),
('2ba72d3c-d4e3-40ef-b014-16fc23a227bf', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'ديكور القاعة الكامل', 'Full Hall Decor', 'تنسيق كامل للقاعة + ورود + إضاءة', 15000),
('66983be0-104a-42c8-931f-bf981cf48125', 'e6b165de-4c3c-4826-a1f8-c400d61d3d9b', 'باقة الأحلام', 'Dream Package', 'ديكور فاخر + كوشة استثنائية + ممر ورود', 30000);

-- ============================================
-- 4. DRESSES (الفساتين)
-- ============================================

INSERT INTO dresses (id, seller_id, title, description, price, size, condition, city, category, images, whatsapp_enabled, is_active, is_sold) VALUES
('c3ff9e63-aef7-4672-848a-d9a292e4db9c', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان زفاف ملكي أبيض', 'فستان زفاف جديد لم يُلبس - تصميم إيطالي فاخر مع ذيل طويل وتطريز يدوي', 8500, 'M', 'new', 'الرياض', 'wedding', ARRAY['https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800', 'https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=800'], true, true, false),

('49e46b97-ef5e-4e24-a0b3-e9326fa94fd9', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان سهرة أحمر فاخر', 'فستان سهرة راقي - لُبس مرة واحدة فقط - ماركة عالمية', 3200, 'L', 'used', 'جدة', 'wedding', ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'], true, true, false),

('b75d95a0-21c8-4f46-8034-5088aaeac222', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان خطوبة ذهبي', 'فستان خطوبة ذهبي أنيق - جديد بالتاج', 4500, 'S', 'new', 'الرياض', 'wedding', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], true, true, false),

('ff24fc5c-2ded-40b2-aa2b-545c51535c94', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان زفاف كلاسيكي', 'فستان زفاف كلاسيكي رائع - لُبس مرة واحدة - مع طرحة', 6000, 'M', 'used', 'الدمام', 'wedding', ARRAY['https://images.unsplash.com/photo-1511285605577-4d62fb50d2f7?w=800'], true, true, false),

('20d60d35-b3be-4187-a006-bf770c563e62', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان سهرة أسود', 'فستان سهرة أسود طويل - تصميم عصري أنيق', 2800, 'XL', 'new', 'مكة المكرمة', 'wedding', ARRAY['https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800'], true, true, false),

('ab11583b-3595-46e8-9d5c-65e85496477d', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان خطوبة وردي', 'فستان خطوبة وردي ناعم مع تطريز لؤلؤ', 3800, 'S', 'new', 'جدة', 'wedding', ARRAY['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'], true, true, false),

('22f3a6db-08fb-49bc-8470-389f56db67be', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان زفاف عصري', 'فستان زفاف من تصميم مصمم عالمي - قطعة فريدة', 12000, 'M', 'new', 'الرياض', 'wedding', ARRAY['https://images.unsplash.com/photo-1549416878-879c6a88e6b1?w=800', 'https://images.unsplash.com/photo-1522069213448-443a614da9b6?w=800'], true, true, false),

('c34a4a4c-44f3-49f4-a867-565fbf0d274d', '9ed58c5c-b62c-406b-a37f-ea64bb37f5b3', 'فستان سهرة أزرق', 'فستان سهرة أزرق ملكي - حالة ممتازة', 2500, 'L', 'used', 'المدينة المنورة', 'wedding', ARRAY['https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800'], true, true, false);

-- ============================================
-- ملاحظة: الجداول التالية تحتاج ربط بالمستخدمين
-- profiles, user_roles, hall_bookings, service_bookings, reviews
-- ستحتاج إنشاء المستخدمين أولاً في Supabase الجديد
-- ثم تحديث الـ user_id في الـ INSERT statements
-- ============================================

-- نهاية التصدير
