import { useState } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Users, Calendar, Check, X, 
  ChevronLeft, ChevronRight, Minus, Plus, MessageCircle
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
  const [guestCountMen, setGuestCountMen] = useState(100);
  const [guestCountWomen, setGuestCountWomen] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  if (!hall) return null;

  // Normalize hall data
  const normalizedHall = isDatabaseHall(hall) ? {
    id: hall.id,
    nameAr: hall.name_ar,
    cityAr: hall.city,
    image: hall.cover_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    priceWeekday: hall.price_weekday,
    priceWeekend: hall.price_weekend,
    capacityMen: hall.capacity_men,
    capacityWomen: hall.capacity_women,
    features: hall.features || [],
    phone: hall.phone,
    whatsappEnabled: hall.whatsapp_enabled,
    rating: ratingData?.average_rating || 0,
    reviewsCount: ratingData?.reviews_count || 0,
  } : {
    id: hall.id,
    nameAr: hall.nameAr,
    cityAr: hall.cityAr,
    image: hall.image,
    priceWeekday: hall.price,
    priceWeekend: Math.round(hall.price * 1.2),
    capacityMen: hall.capacityMen,
    capacityWomen: hall.capacityWomen,
    features: hall.features,
    phone: undefined,
    whatsappEnabled: false,
    rating: hall.rating,
    reviewsCount: 0,
  };

  const today = startOfDay(new Date());
  const isWeekend = selectedDate ? [4, 5].includes(selectedDate.getDay()) : false; // Thu, Fri
  const price = isWeekend ? normalizedHall.priceWeekend : normalizedHall.priceWeekday;

  const resetForm = () => {
    setStep("details");
    setSelectedDate(undefined);
    setGuestCountMen(100);
    setGuestCountWomen(100);
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
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-primary">SAR {normalizedHall.priceWeekday.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">أيام الأسبوع</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-resale">SAR {normalizedHall.priceWeekend.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">نهاية الأسبوع</span>
        </div>
      </div>

      {/* WhatsApp Contact Button */}
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

      {/* Reviews Section */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-right">التقييمات</h4>
        <HallReviews hallId={hall.id} hallName={normalizedHall.nameAr} />
      </div>

      <Button 
        className="w-full gold-gradient text-white"
        size="lg"
        onClick={() => setStep("date")}
      >
        <Calendar className="w-5 h-5 ml-2" />
        اختر التاريخ والحجز
      </Button>
    </motion.div>
  );

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

      <div className="flex justify-center">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ar}
          disabled={(date) => isBefore(date, today)}
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
          <span className="text-sm text-muted-foreground">الحد الأقصى: {normalizedHall.capacityMen}</span>
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
            onClick={() => setGuestCountMen(Math.max(10, guestCountMen - 10))}
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
          <span className="text-sm text-muted-foreground">الحد الأقصى: {normalizedHall.capacityWomen}</span>
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
            onClick={() => setGuestCountWomen(Math.max(10, guestCountWomen - 10))}
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
