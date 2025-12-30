import { motion } from "framer-motion";
import { MapPin, Star, Users, Heart } from "lucide-react";
import { WeddingHall } from "@/data/weddingData";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ar } from "date-fns/locale";

// Support both database schema and mock data schema
interface DatabaseHall {
  id: string;
  name_ar: string;
  city: string;
  cover_image?: string | null;
  price_weekday: number;
  capacity_men: number;
  capacity_women: number;
  phone?: string | null;
  whatsapp_enabled?: boolean | null;
}

type HallData = WeddingHall | DatabaseHall;

interface HallCardProps {
  hall: HallData;
  index: number;
  onClick?: () => void;
}

// Type guards to check which schema we're dealing with
function isDatabaseHall(hall: HallData): hall is DatabaseHall {
  return 'name_ar' in hall;
}

export function HallCard({ hall, index, onClick }: HallCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Normalize data for both schemas
  const hallId = hall.id;
  const hallName = isDatabaseHall(hall) ? hall.name_ar : hall.nameAr;
  const hallCity = isDatabaseHall(hall) ? hall.city : hall.cityAr;
  const hallImage = isDatabaseHall(hall) ? (hall.cover_image || '/placeholder.svg') : hall.image;
  const hallPrice = isDatabaseHall(hall) ? hall.price_weekday : hall.price;
  const capacityMen = isDatabaseHall(hall) ? hall.capacity_men : hall.capacityMen;
  const capacityWomen = isDatabaseHall(hall) ? hall.capacity_women : hall.capacityWomen;
  const rating = isDatabaseHall(hall) ? undefined : hall.rating;

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
      case 'resale': return 'bg-amber-500';
      default: return 'bg-muted-foreground/30';
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(hallId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
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
            SAR {hallPrice.toLocaleString()}
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
      <div className="p-4 space-y-3">
        {/* Capacity */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-arabic">رجال {capacityMen}</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-arabic">نساء {capacityWomen}</span>
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        {/* 7-Day Availability Preview - Simple dots design */}
        {isDatabaseHall(hall) && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              {next7Days.map((dateStr, i) => {
                const status = availabilityMap.get(dateStr);
                
                return (
                  <div 
                    key={dateStr}
                    className={`w-3 h-3 rounded-full ${getStatusColor(status)} transition-all`}
                    title={format(addDays(new Date(), i), 'EEEE d MMMM', { locale: ar })}
                  />
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground font-arabic">توفر ٧ أيام</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
