import { motion } from "framer-motion";
import { MapPin, Star, Users, Heart, Navigation } from "lucide-react";
import { WeddingHall } from "@/data/weddingData";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { DistanceBadge } from "./DistanceBadge";

// Support both database schema and mock data schema
interface DatabaseHall {
  id: string;
  name_ar: string;
  city: string;
  cover_image?: string | null;
  price_weekday: number;
  price_weekend?: number;
  capacity_men: number;
  capacity_women: number;
  phone?: string | null;
  whatsapp_enabled?: boolean | null;
  pricing_type?: string | null;
  price_per_chair_weekday?: number | null;
  price_per_chair_weekend?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

type HallData = WeddingHall | DatabaseHall;

interface HallCardProps {
  hall: HallData;
  index: number;
  onClick?: () => void;
  userLatitude?: number | null;
  userLongitude?: number | null;
}

// Type guards to check which schema we're dealing with
function isDatabaseHall(hall: HallData): hall is DatabaseHall {
  return 'name_ar' in hall;
}

export function HallCard({ hall, index, onClick, userLatitude, userLongitude }: HallCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Normalize data for both schemas
  const hallId = hall.id;
  const hallName = isDatabaseHall(hall) ? hall.name_ar : hall.nameAr;
  const hallCity = isDatabaseHall(hall) ? hall.city : hall.cityAr;
  const hallImage = isDatabaseHall(hall) ? (hall.cover_image || '/placeholder.svg') : hall.image;
  const capacityMen = isDatabaseHall(hall) ? hall.capacity_men : hall.capacityMen;
  const capacityWomen = isDatabaseHall(hall) ? hall.capacity_women : hall.capacityWomen;
  const rating = isDatabaseHall(hall) ? undefined : hall.rating;
  const hallLatitude = isDatabaseHall(hall) ? hall.latitude : null;
  const hallLongitude = isDatabaseHall(hall) ? hall.longitude : null;
  
  // Pricing logic
  const isPerChair = isDatabaseHall(hall) && hall.pricing_type === 'per_chair';
  const hallPrice = isDatabaseHall(hall) 
    ? (isPerChair ? (hall.price_per_chair_weekday || 0) : hall.price_weekday)
    : hall.price;
  const priceLabel = isPerChair ? '/كرسي' : '';

  const isHallFavorite = isFavorite(hallId);

  // Fetch next 7 days availability
  const next7Days = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'));
  
  const { data: availabilityData } = useQuery({
    queryKey: ['hall-availability-preview', hallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hall_availability')
        .select('date, status')
        .eq('hall_id', hallId)
        .in('date', next7Days);
      
      if (error) throw error;
      return data || [];
    },
    enabled: isDatabaseHall(hall),
  });

  // Create availability map
  const availabilityMap = new Map(
    availabilityData?.map(item => [item.date, item.status]) || []
  );

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'available': return 'bg-emerald-500';
      case 'booked': return 'bg-rose-500';
      case 'resale': return 'bg-amber-400';
      default: return 'bg-muted-foreground/30';
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(hallId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className="card-luxe rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hallImage} 
          alt={hallName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3 gold-gradient px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-sm font-bold text-white">
            SAR {hallPrice.toLocaleString()}{priceLabel && <span className="text-xs font-arabic mr-1">{priceLabel}</span>}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isHallFavorite 
              ? "bg-white" 
              : "bg-black/40 backdrop-blur-sm hover:bg-white/90"
          }`}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isHallFavorite 
                ? "text-red-500 fill-red-500" 
                : "text-white hover:text-red-500"
            }`} 
          />
        </button>
        
        {/* Rating (only for mock data) */}
        {rating && (
          <div className="absolute top-14 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-resale fill-resale" />
            <span className="text-sm font-semibold text-white">{rating}</span>
          </div>
        )}

        {/* Distance Badge */}
        <DistanceBadge
          hallLatitude={hallLatitude}
          hallLongitude={hallLongitude}
          userLatitude={userLatitude}
          userLongitude={userLongitude}
          className="absolute bottom-14 left-3"
        />
        
        {/* Hall Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-xl font-bold text-white mb-1 text-right">
            {hallName}
          </h3>
          <div className="flex items-center gap-1 justify-end text-white/90">
            <span className="text-sm">{hallCity}</span>
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      {/* Details Section */}
      <div className="p-4 space-y-4">
        {/* Capacity */}
        <div className="flex items-center justify-end gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-arabic">رجال {capacityMen}</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-arabic">نساء {capacityWomen}</span>
            <Users className="w-4 h-4" />
          </div>
        </div>
        
        {/* 7-Day Availability Preview */}
        {isDatabaseHall(hall) && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            {/* Title */}
            <h4 className="text-sm font-semibold text-foreground text-right font-arabic">
              الأيام المتاحة
            </h4>
            
            {/* Days with dots */}
            <div className="flex items-center justify-between" dir="rtl">
              {next7Days.map((dateStr, i) => {
                const date = addDays(new Date(), i);
                const status = availabilityMap.get(dateStr);
                const dayName = format(date, 'EEEE', { locale: ar });
                
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-2">
                    <div 
                      className={`w-3.5 h-3.5 rounded-full ${getStatusColor(status)} transition-all`}
                    />
                    <span className="text-[11px] text-muted-foreground font-arabic">{dayName}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-arabic">متاح</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-arabic">محجوز</span>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-arabic">إعادة بيع</span>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
