import { 
  Sparkles, Heart, Crown, Users, Sofa, Coffee, Gift, Shirt, 
  Smartphone, Wind, UtensilsCrossed, Diamond, Mail, Music, 
  Headphones, Hotel, UserCheck, Camera, Bath, Palette, Candy, 
  QrCode, Flame, GlassWater, Drum, Apple, User
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface ServiceCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: LucideIcon;
  color: string;
}

export interface Vendor {
  id: string;
  name: string;
  nameAr: string;
  categoryId: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  description: string;
  descriptionAr: string;
}

export interface WeddingHall {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  price: number;
  capacityMen: number;
  capacityWomen: number;
  image: string;
  rating: number;
  reviews: number;
  availability: ('available' | 'booked' | 'resale')[];
  features: string[];
}

export interface Dress {
  id: string;
  title: string;
  price: number;
  size: string;
  city: string;
  phone: string;
  sellerName: string;
  description: string;
  images: string[];
}

// Women's Service Categories
export const womenCategories: ServiceCategory[] = [
  { id: 'hair', nameAr: 'تساريح', nameEn: 'Hair Styling', icon: Sparkles, color: 'from-pink-400 to-rose-500' },
  { id: 'makeup', nameAr: 'مكياج', nameEn: 'Makeup', icon: Palette, color: 'from-rose-400 to-pink-500' },
  { id: 'dresses', nameAr: 'فساتين زفاف', nameEn: 'Wedding Dresses', icon: Crown, color: 'from-amber-400 to-yellow-500' },
  { id: 'coordinator', nameAr: 'مشرفات قاعة', nameEn: 'Hall Coordinator', icon: Users, color: 'from-purple-400 to-violet-500' },
  { id: 'kosha', nameAr: 'كوش افراح', nameEn: 'Wedding Stage / Kosha', icon: Sofa, color: 'from-emerald-400 to-green-500' },
  { id: 'coffee-corner', nameAr: 'ركن قهوة', nameEn: 'Coffee Corner', icon: Coffee, color: 'from-amber-600 to-orange-500' },
  { id: 'favors', nameAr: 'توزيعات', nameEn: 'Wedding Favors', icon: Gift, color: 'from-pink-300 to-rose-400' },
  { id: 'abaya', nameAr: 'استلام عبايات', nameEn: 'Abaya Receiving', icon: Shirt, color: 'from-slate-500 to-gray-600' },
  { id: 'phones', nameAr: 'تفتيش جوالات', nameEn: 'Phone Collection', icon: Smartphone, color: 'from-blue-400 to-cyan-500' },
  { id: 'perfume', nameAr: 'ركن عطور', nameEn: 'Perfume Corner', icon: Wind, color: 'from-violet-400 to-purple-500' },
  { id: 'buffet', nameAr: 'بوفيهات عشاء', nameEn: 'Dinner Buffets', icon: UtensilsCrossed, color: 'from-orange-400 to-red-500' },
  { id: 'jewelry', nameAr: 'تقديم شبكات', nameEn: 'Jewelry Presentation', icon: Diamond, color: 'from-cyan-300 to-blue-400' },
  { id: 'invitations', nameAr: 'كروت دعوة', nameEn: 'Invitation Cards', icon: Mail, color: 'from-rose-300 to-pink-400' },
  { id: 'singers', nameAr: 'مطربات', nameEn: 'Female Singers', icon: Music, color: 'from-fuchsia-400 to-pink-500' },
  { id: 'dj', nameAr: 'دي جي', nameEn: 'DJ', icon: Headphones, color: 'from-indigo-400 to-purple-500' },
  { id: 'hotel', nameAr: 'حجوزات فنادق', nameEn: 'Hotel Booking', icon: Hotel, color: 'from-teal-400 to-emerald-500' },
  { id: 'assistants', nameAr: 'مساعدات العروس', nameEn: 'Bridal Assistants', icon: UserCheck, color: 'from-pink-400 to-rose-400' },
  { id: 'photographer-w', nameAr: 'تصوير نسائي', nameEn: 'Photographer', icon: Camera, color: 'from-amber-400 to-orange-400' },
  { id: 'hammam', nameAr: 'حمام مغربي', nameEn: 'Moroccan Bath', icon: Bath, color: 'from-sky-400 to-blue-500' },
  { id: 'henna', nameAr: 'نقاشات حناء', nameEn: 'Henna Artists', icon: Heart, color: 'from-orange-500 to-red-500' },
  { id: 'chocolate', nameAr: 'ضيافة شوكولاتة', nameEn: 'Chocolate Services', icon: Candy, color: 'from-amber-700 to-orange-600' },
  { id: 'e-invitation', nameAr: 'دعوات إلكترونية', nameEn: 'E-Invitation Designer', icon: Mail, color: 'from-violet-400 to-indigo-500' },
  { id: 'barcode', nameAr: 'تصميم باركود دخول', nameEn: 'Entry Barcode Designer', icon: QrCode, color: 'from-gray-500 to-slate-600' },
];

// Men's Service Categories
export const menCategories: ServiceCategory[] = [
  { id: 'incense', nameAr: 'تطييب وبخور', nameEn: 'Incense / Bukhoor', icon: Flame, color: 'from-amber-500 to-orange-600' },
  { id: 'sabbabeen', nameAr: 'قهوجيين وصبابين', nameEn: 'Coffee Servers', icon: GlassWater, color: 'from-amber-600 to-yellow-600' },
  { id: 'ardah', nameAr: 'فرق العرضة السعودية', nameEn: 'Ardah Dance', icon: Drum, color: 'from-emerald-500 to-green-600' },
  { id: 'sweets', nameAr: 'حلا قدوع', nameEn: 'Sweets', icon: Candy, color: 'from-pink-400 to-rose-500' },
  { id: 'dates', nameAr: 'تمور فاخرة', nameEn: 'Premium Dates', icon: Apple, color: 'from-amber-700 to-yellow-700' },
  { id: 'photographer-m', nameAr: 'تصوير رجالي', nameEn: 'Photographer', icon: Camera, color: 'from-slate-500 to-gray-600' },
];

// Mock Vendors
export const vendors: Vendor[] = [
  // Sabbabeen Vendors
  {
    id: 'v1',
    name: 'Royal Sabbabeen',
    nameAr: 'الصبابين الملكيين',
    categoryId: 'sabbabeen',
    rating: 4.9,
    reviews: 234,
    price: 'SAR 2,500',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    description: 'Premium Arabic coffee service with traditional attire',
    descriptionAr: 'خدمة قهوة عربية فاخرة مع الزي التقليدي',
  },
  {
    id: 'v2',
    name: 'Heritage Coffee',
    nameAr: 'قهوة التراث',
    categoryId: 'sabbabeen',
    rating: 4.7,
    reviews: 156,
    price: 'SAR 1,800',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    description: 'Traditional Saudi coffee serving with authentic experience',
    descriptionAr: 'تقديم قهوة سعودية تقليدية بتجربة أصيلة',
  },
  {
    id: 'v3',
    name: 'Al Dallah Gold',
    nameAr: 'الدلة الذهبية',
    categoryId: 'sabbabeen',
    rating: 4.8,
    reviews: 189,
    price: 'SAR 2,200',
    image: 'https://images.unsplash.com/photo-1578374173713-f8ca39e84223?w=400',
    description: 'Luxury coffee service for elite weddings',
    descriptionAr: 'خدمة قهوة فاخرة للأعراس الراقية',
  },
  // Kosha Vendors
  {
    id: 'v4',
    name: 'Dream Kosha',
    nameAr: 'كوشة الأحلام',
    categoryId: 'kosha',
    rating: 4.9,
    reviews: 312,
    price: 'SAR 8,000',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    description: 'Luxurious wedding stage designs with flowers and lighting',
    descriptionAr: 'تصاميم منصة زفاف فاخرة مع الزهور والإضاءة',
  },
  {
    id: 'v5',
    name: 'Royal Stages',
    nameAr: 'المنصات الملكية',
    categoryId: 'kosha',
    rating: 4.8,
    reviews: 267,
    price: 'SAR 12,000',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    description: 'Grand royal kosha designs for unforgettable moments',
    descriptionAr: 'تصاميم كوشة ملكية فخمة للحظات لا تُنسى',
  },
  {
    id: 'v6',
    name: 'Elegant Decor',
    nameAr: 'الديكور الأنيق',
    categoryId: 'kosha',
    rating: 4.6,
    reviews: 145,
    price: 'SAR 6,500',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
    description: 'Modern and elegant wedding stage setups',
    descriptionAr: 'تصاميم منصة زفاف عصرية وأنيقة',
  },
];

// Mock Wedding Halls
export const weddingHalls: WeddingHall[] = [
  {
    id: 'h1',
    name: 'The Royal Palace Hall',
    nameAr: 'قاعة القصر الملكي',
    city: 'Riyadh',
    cityAr: 'الرياض',
    price: 45000,
    capacityMen: 500,
    capacityWomen: 600,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    rating: 4.9,
    reviews: 423,
    availability: ['available', 'booked', 'available', 'resale', 'available', 'booked', 'available'],
    features: ['Valet Parking', 'Full Catering', 'Bridal Suite', 'VIP Lounge'],
  },
  {
    id: 'h2',
    name: 'Diamond Grand Ballroom',
    nameAr: 'قاعة الماس الكبرى',
    city: 'Jeddah',
    cityAr: 'جدة',
    price: 38000,
    capacityMen: 400,
    capacityWomen: 450,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
    rating: 4.8,
    reviews: 356,
    availability: ['booked', 'booked', 'available', 'available', 'resale', 'available', 'booked'],
    features: ['Ocean View', 'Premium Sound', 'Garden Area', 'Prayer Room'],
  },
  {
    id: 'h3',
    name: 'Pearl Wedding Venue',
    nameAr: 'قاعة اللؤلؤة',
    city: 'Dammam',
    cityAr: 'الدمام',
    price: 32000,
    capacityMen: 350,
    capacityWomen: 400,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    rating: 4.7,
    reviews: 234,
    availability: ['available', 'available', 'booked', 'available', 'available', 'resale', 'available'],
    features: ['Modern Design', 'LED Screens', 'Kids Area', 'Makeup Room'],
  },
  {
    id: 'h4',
    name: 'Golden Crown Hall',
    nameAr: 'قاعة التاج الذهبي',
    city: 'Riyadh',
    cityAr: 'الرياض',
    price: 55000,
    capacityMen: 700,
    capacityWomen: 800,
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    rating: 4.9,
    reviews: 512,
    availability: ['resale', 'available', 'available', 'booked', 'available', 'available', 'booked'],
    features: ['Crystal Chandeliers', 'Royal Decor', 'Private Entrance', 'Photography Studio'],
  },
  {
    id: 'h5',
    name: 'Emerald Gardens',
    nameAr: 'حدائق الزمرد',
    city: 'Jeddah',
    cityAr: 'جدة',
    price: 42000,
    capacityMen: 450,
    capacityWomen: 500,
    image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
    rating: 4.6,
    reviews: 198,
    availability: ['available', 'booked', 'resale', 'available', 'booked', 'available', 'available'],
    features: ['Garden Wedding', 'Outdoor Area', 'Tent Options', 'Catering Kitchen'],
  },
];

export const cities = [
  { id: 'all', nameEn: 'All Cities', nameAr: 'كل المدن' },
  { id: 'riyadh', nameEn: 'Riyadh', nameAr: 'الرياض' },
  { id: 'jeddah', nameEn: 'Jeddah', nameAr: 'جدة' },
  { id: 'dammam', nameEn: 'Dammam', nameAr: 'الدمام' },
  { id: 'mecca', nameEn: 'Mecca', nameAr: 'مكة' },
  { id: 'medina', nameEn: 'Medina', nameAr: 'المدينة' },
];

// Arabic city names for dress filtering
export const saudiCities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];

// Mock Dresses for C2C Marketplace
export const mockDresses: Dress[] = [
  {
    id: 'd1',
    title: 'فستان زفاف ملكي من إيلي صعب',
    price: 15000,
    size: 'M',
    city: 'الرياض',
    phone: '966501234567',
    sellerName: 'نورة الأحمد',
    description: 'فستان زفاف فاخر من تصميم إيلي صعب، تم ارتداؤه مرة واحدة فقط. يتميز بتطريز يدوي راقي وذيل طويل. مناسب للعروس التي تبحث عن الفخامة والأناقة.',
    images: [
      'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600',
      'https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=600',
    ],
  },
  {
    id: 'd2',
    title: 'فستان سهرة ذهبي أنيق',
    price: 3500,
    size: 'S',
    city: 'جدة',
    phone: '966509876543',
    sellerName: 'سارة العتيبي',
    description: 'فستان سهرة باللون الذهبي مع تفاصيل كريستال. مثالي لحفلات الخطوبة أو حضور الأعراس.',
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    ],
  },
  {
    id: 'd3',
    title: 'فستان عروس كلاسيكي دانتيل',
    price: 8000,
    size: 'L',
    city: 'الدمام',
    phone: '966551122334',
    sellerName: 'ليلى الشمري',
    description: 'فستان زفاف كلاسيكي من الدانتيل الفرنسي، أكمام طويلة وقصة أميرية. جديد بالكرتون.',
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
      'https://images.unsplash.com/photo-1522653216967-e63eb6d8a3e6?w=600',
    ],
  },
  {
    id: 'd4',
    title: 'فستان ملكة الليل أسود',
    price: 4200,
    size: 'M',
    city: 'الرياض',
    phone: '966505544332',
    sellerName: 'هند القحطاني',
    description: 'فستان سهرة أسود فاخر مع تطريز ذهبي. مناسب للمناسبات الرسمية والحفلات الخاصة.',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
      'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600',
    ],
  },
  {
    id: 'd5',
    title: 'فستان خطوبة وردي ناعم',
    price: 2800,
    size: 'XS',
    city: 'جدة',
    phone: '966508877665',
    sellerName: 'ريم الحربي',
    description: 'فستان خطوبة باللون الوردي الفاتح مع تنورة منفوشة. ارتديته مرة واحدة في حفل خطوبتي.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
    ],
  },
  {
    id: 'd6',
    title: 'فستان زفاف سندريلا',
    price: 12000,
    size: 'M',
    city: 'الدمام',
    phone: '966502233445',
    sellerName: 'منال السبيعي',
    description: 'فستان زفاف ساحر بتصميم سندريلا مع تنورة ضخمة وكورسيه مزين بالكريستال. حالة ممتازة.',
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
      'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600',
    ],
  },
];
