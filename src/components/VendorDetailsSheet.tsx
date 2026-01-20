import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, MapPin, MessageCircle, Phone, ChevronRight, ChevronLeft,
  Calendar, Package, Clock, CheckCircle, XCircle, AlertCircle, CalendarPlus
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { ar } from "date-fns/locale";
import { VendorReviews } from "./VendorReviews";
import { ServiceBookingSheet } from "./ServiceBookingSheet";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
interface ServicePackage {
  id: string;
  name_ar: string;
  name_en: string | null;
  price: number;
  description: string | null;
}

interface Availability {
  id: string;
  date: string;
  status: 'available' | 'booked' | 'unavailable';
}

interface ServiceBookingSheetWithDateProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    name_ar: string;
    name_en?: string | null;
  };
  packages: ServicePackage[];
  initialDate?: Date;
}

interface VendorDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: {
    id: string;
    nameAr: string;
    name?: string;
    descriptionAr?: string;
    description?: string;
    rating: number;
    reviews?: number;
    city?: string;
    phone?: string;
    portfolio_images?: string[];
    image?: string;
  } | null;
}

export function VendorDetailsSheet({ open, onOpenChange, vendor }: VendorDetailsSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | undefined>();
  const [chatOpen, setChatOpen] = useState(false);
  const [vendorOwnerId, setVendorOwnerId] = useState<string | null>(null);
  
  const images = vendor?.portfolio_images?.length 
    ? vendor.portfolio_images 
    : vendor?.image 
      ? [vendor.image] 
      : ['/placeholder.svg'];

  useEffect(() => {
    if (open && vendor?.id) {
      fetchData();
    }
  }, [open, vendor?.id]);

  const fetchData = async () => {
    if (!vendor?.id) return;
    setLoading(true);
    
    try {
      // Fetch packages
      const { data: packagesData } = await supabase
        .from('service_packages')
        .select('*')
        .eq('provider_id', vendor.id)
        .order('price', { ascending: true });
      
      setPackages(packagesData || []);

      // Fetch provider owner_id
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('owner_id')
        .eq('id', vendor.id)
        .single();
      
      if (providerData) {
        setVendorOwnerId(providerData.owner_id);
      }

      // Fetch availability for next 14 days
      const today = startOfToday();
      const { data: availabilityData } = await supabase
        .from('service_provider_availability')
        .select('*')
        .eq('provider_id', vendor.id)
        .gte('date', format(today, 'yyyy-MM-dd'))
        .lte('date', format(addDays(today, 13), 'yyyy-MM-dd'))
        .order('date', { ascending: true });
      
      setAvailability(availabilityData as Availability[] || []);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتواصل مع مقدم الخدمة",
        variant: "destructive",
      });
      return;
    }
    if (!vendorOwnerId) {
      toast({
        title: "خطأ",
        description: "لا يمكن بدء المحادثة حالياً",
        variant: "destructive",
      });
      return;
    }
    setChatOpen(true);
  };

  const handleCall = () => {
    const phone = vendor?.phone || '966500000000';
    window.open(`tel:${phone}`, '_self');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getAvailabilityForDate = (date: Date): 'available' | 'booked' | 'unavailable' | 'unknown' => {
    const found = availability.find(a => isSameDay(new Date(a.date), date));
    return found?.status || 'unknown';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return { 
          icon: CheckCircle, 
          color: 'text-green-500 bg-green-500/10', 
          label: 'متاح' 
        };
      case 'booked':
        return { 
          icon: XCircle, 
          color: 'text-destructive bg-destructive/10', 
          label: 'محجوز' 
        };
      case 'unavailable':
        return { 
          icon: AlertCircle, 
          color: 'text-amber-500 bg-amber-500/10', 
          label: 'غير متاح' 
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-muted-foreground bg-muted', 
          label: '-' 
        };
    }
  };

  // Generate next 7 days for availability display
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  if (!vendor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {/* Image Carousel */}
          <div className="relative h-64 bg-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={vendor.nameAr}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-primary w-6'
                        : 'bg-background/60'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* Header */}
            <div className="text-right">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {vendor.nameAr}
              </h2>
              <div className="flex items-center justify-end gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{vendor.rating?.toFixed(1) || '0.0'}</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                {vendor.city && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{vendor.city}</span>
                    <MapPin className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {(vendor.descriptionAr || vendor.description) && (
              <div className="text-right">
                <h3 className="font-bold text-foreground mb-2 font-arabic">عن الخدمة</h3>
                <p className="text-muted-foreground font-arabic text-sm leading-relaxed">
                  {vendor.descriptionAr || vendor.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Availability Calendar */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-4">
                <h3 className="font-bold text-foreground font-arabic">التوفر هذا الأسبوع</h3>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {next7Days.map((date, index) => {
                  const status = getAvailabilityForDate(date);
                  const config = getStatusConfig(status);
                  const Icon = config.icon;
                  const isAvailable = status === 'available' || status === 'unknown';
                  const hasPackages = packages.length > 0;
                  const canBook = isAvailable && hasPackages;
                  
                  return (
                    <motion.div
                      key={date.toISOString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (canBook) {
                          setSelectedBookingDate(date);
                          setBookingSheetOpen(true);
                        }
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl ${config.color} ${
                        canBook 
                          ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all active:scale-95' 
                          : ''
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
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>متاح</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>محجوز</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>غير متاح</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Packages */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-4">
                <h3 className="font-bold text-foreground font-arabic">الباقات والأسعار</h3>
                <Package className="w-5 h-5 text-primary" />
              </div>
              
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">جاري التحميل...</div>
              ) : packages.length > 0 ? (
                <div className="space-y-3">
                  {packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card-luxe p-4 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <Badge className="bg-primary/10 text-primary border-0 font-bold">
                          {pkg.price.toLocaleString()} ر.س
                        </Badge>
                        <h4 className="font-bold text-foreground font-arabic">
                          {pkg.name_ar}
                        </h4>
                      </div>
                      {pkg.description && (
                        <p className="text-muted-foreground text-sm mt-2 font-arabic text-right">
                          {pkg.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground font-arabic">
                  لا توجد باقات متاحة حالياً
                </div>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {images.length > 1 && (
              <>
                <Separator />
                <div className="text-right">
                  <h3 className="font-bold text-foreground font-arabic mb-3">معرض الأعمال</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary'
                            : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Reviews Section */}
            <VendorReviews providerId={vendor.id} providerName={vendor.nameAr} />

            {/* Book Now Button */}
            {packages.length > 0 && (
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={() => setBookingSheetOpen(true)}
              >
                <CalendarPlus className="w-5 h-5 ml-2" />
                احجز الآن
              </Button>
            )}

            {/* Contact Buttons */}
            <div className="flex gap-3 pt-2 pb-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCall}
              >
                <Phone className="w-4 h-4 ml-2" />
                اتصال
              </Button>
              <Button
                className="flex-1"
                onClick={handleChatClick}
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                محادثة
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Sheet */}
        {vendor && (
          <ServiceBookingSheet
            isOpen={bookingSheetOpen}
            onClose={() => {
              setBookingSheetOpen(false);
              setSelectedBookingDate(undefined);
            }}
            provider={{
              id: vendor.id,
              name_ar: vendor.nameAr,
              name_en: vendor.name,
            }}
            packages={packages}
            initialDate={selectedBookingDate}
          />
        )}

        {/* Chat Sheet */}
        {vendorOwnerId && vendor && (
          <ChatSheet
            open={chatOpen}
            onOpenChange={setChatOpen}
            otherUserId={vendorOwnerId}
            otherUserName={vendor.nameAr}
            context={{ providerId: vendor.id }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}