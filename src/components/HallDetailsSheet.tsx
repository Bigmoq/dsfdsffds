import { useState, useEffect, useMemo } from "react";
import { format, addDays, isBefore, startOfDay, startOfMonth, endOfMonth, startOfToday, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Users, Calendar, Check, X, 
  ChevronLeft, ChevronRight, Minus, Plus, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Clock, Navigation
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { HallReviews } from "./HallReviews";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LocationMap } from "./LocationMap";
import { useGeolocation } from "@/hooks/useGeolocation";

type AvailabilityStatus = 'available' | 'booked' | 'resale';

// Support both old mock data and new database schema
interface DatabaseHall {
  id: string;
  name_ar: string;
  name_en?: string;
  city: string;
  address?: string;
  description?: string;
  price_weekday: number;
  price_weekend: number;
  capacity_men: number;
  capacity_women: number;
  cover_image?: string;
  gallery_images?: string[];
  features?: string[];
  phone?: string;
  whatsapp_enabled?: boolean;
  pricing_type?: string | null;
  price_per_chair_weekday?: number | null;
  price_per_chair_weekend?: number | null;
  min_capacity_men?: number | null;
  min_capacity_women?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface LegacyHall {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  image: string;
  price: number;
  capacityMen: number;
  capacityWomen: number;
  rating: number;
  features: string[];
}

type HallData = DatabaseHall | LegacyHall;

interface HallDetailsSheetProps {
  hall: HallData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = "details" | "date" | "guests" | "confirm";

// Type guard to check if hall is from database
function isDatabaseHall(hall: HallData): hall is DatabaseHall {
  return 'name_ar' in hall;
}

export function HallDetailsSheet({ hall, open, onOpenChange }: HallDetailsSheetProps) {
  const [step, setStep] = useState<BookingStep>("details");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [guestCountMen, setGuestCountMen] = useState(0);
  const [guestCountWomen, setGuestCountWomen] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get user's geolocation for distance calculation
  const { latitude: userLat, longitude: userLon } = useGeolocation();

  // Check if hall is per-chair pricing
  const isPerChair = hall && isDatabaseHall(hall) && hall.pricing_type === 'per_chair';

  // Fetch hall availability
  useEffect(() => {
    if (!hall || !open) return;

    const fetchAvailability = async () => {
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('hall_availability')
        .select('date, status')
        .eq('hall_id', hall.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (!error && data) {
        const availabilityMap: Record<string, AvailabilityStatus> = {};
        data.forEach(item => {
          availabilityMap[item.date] = item.status as AvailabilityStatus;
        });
        setAvailability(availabilityMap);
      }
    };

    fetchAvailability();
  }, [hall, open, currentMonth]);

  // Fetch hall rating from database
  const { data: ratingData } = useQuery({
    queryKey: ['hall-rating', hall?.id],
    queryFn: async () => {
      if (!hall) return null;
      const { data, error } = await supabase
        .rpc('get_hall_rating', { hall_uuid: hall.id });
      if (error) throw error;
      return data?.[0] || { average_rating: 0, reviews_count: 0 };
    },
    enabled: !!hall && isDatabaseHall(hall),
  });

  // Set initial guest counts based on minimum capacity for per-chair halls
  useEffect(() => {
    if (!hall) return;
    if (isPerChair) {
      const minMen = (isDatabaseHall(hall) && hall.min_capacity_men) || 50;
      const minWomen = (isDatabaseHall(hall) && hall.min_capacity_women) || 50;
      setGuestCountMen(minMen);
      setGuestCountWomen(minWomen);
    } else {
      setGuestCountMen(100);
      setGuestCountWomen(100);
    }
  }, [hall?.id, isPerChair]);

  // Early return AFTER all hooks
  if (!hall) return null;

  // Normalize hall data
  const normalizedHall = isDatabaseHall(hall) ? {
    id: hall.id,
    nameAr: hall.name_ar,
    cityAr: hall.city,
    address: hall.address,
    image: hall.cover_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    priceWeekday: hall.price_weekday,
    priceWeekend: hall.price_weekend,
    capacityMen: hall.capacity_men,
    capacityWomen: hall.capacity_women,
    minCapacityMen: hall.min_capacity_men || 0,
    minCapacityWomen: hall.min_capacity_women || 0,
    features: hall.features || [],
    phone: hall.phone,
    whatsappEnabled: hall.whatsapp_enabled,
    rating: ratingData?.average_rating || 0,
    reviewsCount: ratingData?.reviews_count || 0,
    isPerChair: !!isPerChair,
    pricePerChairWeekday: hall.price_per_chair_weekday || 0,
    pricePerChairWeekend: hall.price_per_chair_weekend || 0,
    latitude: hall.latitude,
    longitude: hall.longitude,
  } : {
    id: hall.id,
    nameAr: hall.nameAr,
    cityAr: hall.cityAr,
    address: undefined,
    image: hall.image,
    priceWeekday: hall.price,
    priceWeekend: Math.round(hall.price * 1.2),
    capacityMen: hall.capacityMen,
    capacityWomen: hall.capacityWomen,
    minCapacityMen: 0,
    minCapacityWomen: 0,
    features: hall.features,
    phone: undefined,
    whatsappEnabled: false,
    rating: hall.rating,
    reviewsCount: 0,
    isPerChair: false,
    pricePerChairWeekday: 0,
    pricePerChairWeekend: 0,
    latitude: undefined,
    longitude: undefined,
  };

  const today = startOfDay(new Date());
  const isWeekend = selectedDate ? [4, 5].includes(selectedDate.getDay()) : false; // Thu, Fri
  
  // Calculate total price based on pricing type
  const calculateTotalPrice = () => {
    if (normalizedHall.isPerChair) {
      const pricePerChair = isWeekend ? normalizedHall.pricePerChairWeekend : normalizedHall.pricePerChairWeekday;
      return (guestCountMen + guestCountWomen) * pricePerChair;
    }
    return isWeekend ? normalizedHall.priceWeekend : normalizedHall.priceWeekday;
  };
  
  const price = calculateTotalPrice();

  const resetForm = () => {
    setStep("details");
    setSelectedDate(undefined);
    if (normalizedHall.isPerChair) {
      setGuestCountMen(normalizedHall.minCapacityMen || 50);
      setGuestCountWomen(normalizedHall.minCapacityWomen || 50);
    } else {
      setGuestCountMen(100);
      setGuestCountWomen(100);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBooking = async () => {
    if (!selectedDate) return;

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإتمام الحجز",
        variant: "destructive",
      });
      handleClose();
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("hall_bookings").insert({
        hall_id: hall.id,
        user_id: session.user.id,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        guest_count_men: guestCountMen,
        guest_count_women: guestCountWomen,
        total_price: price,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "تم إرسال طلب الحجز",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        title: "خطأ في الحجز",
        description: error.message || "حدث خطأ أثناء إرسال طلب الحجز",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Hall Image */}
      <div className="relative h-56 rounded-2xl overflow-hidden">
        <img 
          src={normalizedHall.image} 
          alt={normalizedHall.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 right-4 left-4">
          <h3 className="font-display text-2xl font-bold text-white mb-1">
            {normalizedHall.nameAr}
          </h3>
          <div className="flex items-center gap-1 text-white/90">
            <span className="text-sm">{normalizedHall.cityAr}</span>
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-resale mb-1">
            <Star className="w-4 h-4 fill-resale" />
            <span className="font-bold">{normalizedHall.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">التقييم</span>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Users className="w-4 h-4" />
            <span className="font-bold">{normalizedHall.capacityMen}</span>
          </div>
          <span className="text-xs text-muted-foreground">رجال</span>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Users className="w-4 h-4" />
            <span className="font-bold">{normalizedHall.capacityWomen}</span>
          </div>
          <span className="text-xs text-muted-foreground">نساء</span>
        </div>
      </div>

      {/* Features */}
      {normalizedHall.features.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-right">المميزات</h4>
          <div className="flex flex-wrap gap-2 justify-end">
            {normalizedHall.features.map((feature, idx) => (
              <span 
                key={idx}
                className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price Info */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 space-y-3">
        {normalizedHall.isPerChair ? (
          <>
            {/* Per Chair Pricing */}
            <div className="text-center mb-2">
              <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full font-arabic">
                التسعير بالكرسي
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-primary">
                SAR {normalizedHall.pricePerChairWeekday.toLocaleString()}/كرسي
              </span>
              <span className="text-sm text-muted-foreground">أيام الأسبوع</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-resale">
                SAR {normalizedHall.pricePerChairWeekend.toLocaleString()}/كرسي
              </span>
              <span className="text-sm text-muted-foreground">نهاية الأسبوع</span>
            </div>
            {/* Minimum Capacity */}
            {(normalizedHall.minCapacityMen > 0 || normalizedHall.minCapacityWomen > 0) && (
              <div className="border-t border-border/50 pt-3 mt-2">
                <p className="text-xs text-muted-foreground text-center mb-2">الحد الأدنى للكراسي</p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  {normalizedHall.minCapacityMen > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">{normalizedHall.minCapacityMen}</span>
                      <span className="text-muted-foreground">رجال</span>
                    </div>
                  )}
                  {normalizedHall.minCapacityWomen > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">{normalizedHall.minCapacityWomen}</span>
                      <span className="text-muted-foreground">نساء</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Total Pricing */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-primary">SAR {normalizedHall.priceWeekday.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">أيام الأسبوع</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-resale">SAR {normalizedHall.priceWeekend.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">نهاية الأسبوع</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Availability - Next 7 Days */}
      <div className="space-y-3">
        <div className="flex items-center justify-end gap-2">
          <h4 className="font-semibold text-foreground font-arabic">التوفر هذا الأسبوع</h4>
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i)).map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const status = availability[dateStr] || 'available';
            const isAvailable = status === 'available' || status === 'resale';
            
            const getQuickStatusConfig = (s: string) => {
              switch (s) {
                case 'available':
                  return { icon: CheckCircle, color: 'text-available bg-available/10', label: 'متاح' };
                case 'booked':
                  return { icon: XCircle, color: 'text-booked bg-booked/10', label: 'محجوز' };
                case 'resale':
                  return { icon: AlertCircle, color: 'text-resale bg-resale/10', label: 'إعادة بيع' };
                default:
                  return { icon: CheckCircle, color: 'text-available bg-available/10', label: 'متاح' };
              }
            };
            
            const config = getQuickStatusConfig(status);
            const Icon = config.icon;
            
            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (isAvailable) {
                    setSelectedDate(date);
                    setStep("guests");
                  }
                }}
                className={`flex flex-col items-center p-2 rounded-xl ${config.color} ${
                  isAvailable 
                    ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all active:scale-95' 
                    : 'opacity-60'
                }`}
              >
                <span className="text-xs text-muted-foreground mb-1">
                  {format(date, 'EEE', { locale: ar })}
                </span>
                <span className="text-sm font-bold mb-1">
                  {format(date, 'd')}
                </span>
                <Icon className="w-4 h-4" />
              </motion.div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-available" />
            <span>متاح</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-booked" />
            <span>محجوز</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-resale" />
            <span>إعادة بيع</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          انقر على يوم متاح للحجز السريع
        </p>
      </div>

      {/* Book Button - After Availability */}
      <Button 
        className="w-full gold-gradient text-white"
        size="lg"
        onClick={() => setStep("date")}
      >
        <Calendar className="w-5 h-5 ml-2" />
        اختر التاريخ والحجز
      </Button>

      {/* Reviews Section */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-right">التقييمات</h4>
        <HallReviews hallId={hall.id} hallName={normalizedHall.nameAr} />
      </div>

      {/* Location Map - At the end */}
      {normalizedHall.latitude && normalizedHall.longitude && (
        <div className="space-y-3">
          <div className="flex items-center justify-end gap-2">
            <h4 className="font-semibold text-foreground font-arabic">الموقع</h4>
            <Navigation className="w-5 h-5 text-primary" />
          </div>
          <LocationMap
            latitude={normalizedHall.latitude}
            longitude={normalizedHall.longitude}
            name={normalizedHall.nameAr}
            address={normalizedHall.address}
            userLatitude={userLat}
            userLongitude={userLon}
          />
        </div>
      )}

      {/* WhatsApp Contact Button - At the very end */}
      {normalizedHall.phone && normalizedHall.whatsappEnabled && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            const phone = normalizedHall.phone!.replace(/\D/g, '');
            const message = encodeURIComponent(`مرحباً، أرغب في الاستفسار عن قاعة ${normalizedHall.nameAr}`);
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
          }}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
          size="lg"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-arabic">تواصل عبر واتساب</span>
        </Button>
      )}
    </motion.div>
  );

  const getDateStatus = (date: Date): AvailabilityStatus | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability[dateStr] || null;
  };

  const getStatusStyles = (status: AvailabilityStatus | null) => {
    switch (status) {
      case 'available':
        return 'bg-available text-white hover:bg-available/90';
      case 'booked':
        return 'bg-booked text-white opacity-60 cursor-not-allowed';
      case 'resale':
        return 'bg-resale text-white hover:bg-resale/90';
      default:
        return '';
    }
  };

  const renderDateSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setStep("details")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h3 className="font-display text-xl font-bold text-foreground">
          اختر تاريخ الحفل
        </h3>
        <div className="w-10" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-available" />
          <span className="text-muted-foreground">متاح</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-booked" />
          <span className="text-muted-foreground">محجوز</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-resale" />
          <span className="text-muted-foreground">إعادة بيع</span>
        </div>
      </div>

      <div className="flex justify-center">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const status = getDateStatus(date);
              if (status !== 'booked') {
                setSelectedDate(date);
              }
            }
          }}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={ar}
          disabled={(date) => {
            if (isBefore(date, today)) return true;
            const status = getDateStatus(date);
            return status === 'booked';
          }}
          modifiers={{
            available: (date) => getDateStatus(date) === 'available',
            booked: (date) => getDateStatus(date) === 'booked',
            resale: (date) => getDateStatus(date) === 'resale',
          }}
          modifiersClassNames={{
            available: 'bg-available text-white hover:bg-available/90',
            booked: 'bg-booked text-white opacity-60',
            resale: 'bg-resale text-white hover:bg-resale/90',
          }}
          className="rounded-xl border border-border pointer-events-auto"
        />
      </div>

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-xl p-4 text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">التاريخ المختار</p>
          <p className="font-bold text-lg text-foreground">
            {format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })}
          </p>
          <p className={cn(
            "text-sm font-medium",
            isWeekend ? "text-resale" : "text-primary"
          )}>
            {isWeekend ? "نهاية الأسبوع" : "يوم عادي"} - SAR {price.toLocaleString()}
          </p>
        </motion.div>
      )}

      <Button 
        className="w-full gold-gradient text-white"
        size="lg"
        disabled={!selectedDate}
        onClick={() => setStep("guests")}
      >
        <ChevronLeft className="w-5 h-5 ml-2" />
        التالي
      </Button>
    </motion.div>
  );

  const renderGuestSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setStep("date")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h3 className="font-display text-xl font-bold text-foreground">
          عدد الضيوف
        </h3>
        <div className="w-10" />
      </div>

      {/* Men Guests */}
      <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {normalizedHall.isPerChair && normalizedHall.minCapacityMen > 0 && (
              <span className="ml-2">الحد الأدنى: {normalizedHall.minCapacityMen} |</span>
            )}
            الحد الأقصى: {normalizedHall.capacityMen}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">قسم الرجال</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setGuestCountMen(Math.max(normalizedHall.isPerChair ? normalizedHall.minCapacityMen : 10, guestCountMen - 10))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-3xl font-bold text-foreground w-20 text-center">
            {guestCountMen}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setGuestCountMen(Math.min(normalizedHall.capacityMen, guestCountMen + 10))}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Women Guests */}
      <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {normalizedHall.isPerChair && normalizedHall.minCapacityWomen > 0 && (
              <span className="ml-2">الحد الأدنى: {normalizedHall.minCapacityWomen} |</span>
            )}
            الحد الأقصى: {normalizedHall.capacityWomen}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">قسم النساء</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setGuestCountWomen(Math.max(normalizedHall.isPerChair ? normalizedHall.minCapacityWomen : 10, guestCountWomen - 10))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-3xl font-bold text-foreground w-20 text-center">
            {guestCountWomen}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setGuestCountWomen(Math.min(normalizedHall.capacityWomen, guestCountWomen + 10))}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dynamic Price Display for Per-Chair Halls */}
      {normalizedHall.isPerChair && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-resale/10 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {guestCountMen + guestCountWomen} كرسي × SAR {(isWeekend ? normalizedHall.pricePerChairWeekend : normalizedHall.pricePerChairWeekday).toLocaleString()}
            </span>
            <span className="text-muted-foreground">حساب السعر</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">SAR {price.toLocaleString()}</span>
            <span className="font-semibold text-foreground">المجموع التقديري</span>
          </div>
        </motion.div>
      )}

      <Button 
        className="w-full gold-gradient text-white"
        size="lg"
        onClick={() => setStep("confirm")}
      >
        <ChevronLeft className="w-5 h-5 ml-2" />
        مراجعة الحجز
      </Button>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setStep("guests")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h3 className="font-display text-xl font-bold text-foreground">
          تأكيد الحجز
        </h3>
        <div className="w-10" />
      </div>

      {/* Booking Summary Card */}
      <div className="bg-gradient-to-br from-primary/10 to-resale/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <img 
            src={normalizedHall.image} 
            alt={normalizedHall.nameAr}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 text-right">
            <h4 className="font-bold text-foreground">{normalizedHall.nameAr}</h4>
            <p className="text-sm text-muted-foreground">{normalizedHall.cityAr}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ar })}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              التاريخ
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{guestCountMen} ضيف</span>
            <span className="text-sm text-muted-foreground">قسم الرجال</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{guestCountWomen} ضيفة</span>
            <span className="text-sm text-muted-foreground">قسم النساء</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">SAR {price.toLocaleString()}</span>
          <span className="font-semibold text-foreground">المجموع</span>
        </div>
      </div>

      {/* Note */}
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          سيتم مراجعة طلب الحجز من قبل إدارة القاعة والرد عليك خلال 24 ساعة
        </p>
      </div>

      <Button 
        className="w-full gold-gradient text-white"
        size="lg"
        disabled={isSubmitting}
        onClick={handleBooking}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            جاري الإرسال...
          </span>
        ) : (
          <>
            <Check className="w-5 h-5 ml-2" />
            تأكيد الحجز
          </>
        )}
      </Button>
    </motion.div>
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-3xl"
        dir="rtl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>تفاصيل القاعة</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-8 pt-4">
          {step === "details" && renderDetails()}
          {step === "date" && renderDateSelection()}
          {step === "guests" && renderGuestSelection()}
          {step === "confirm" && renderConfirmation()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
