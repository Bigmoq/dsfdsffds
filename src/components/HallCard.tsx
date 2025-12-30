import { motion } from "framer-motion";
import { MapPin, Star, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeddingHall } from "@/data/weddingData";

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
  // Normalize data for both schemas
  const hallName = isDatabaseHall(hall) ? hall.name_ar : hall.nameAr;
  const hallCity = isDatabaseHall(hall) ? hall.city : hall.cityAr;
  const hallImage = isDatabaseHall(hall) ? (hall.cover_image || '/placeholder.svg') : hall.image;
  const hallPrice = isDatabaseHall(hall) ? hall.price_weekday : hall.price;
  const capacityMen = isDatabaseHall(hall) ? hall.capacity_men : hall.capacityMen;
  const capacityWomen = isDatabaseHall(hall) ? hall.capacity_women : hall.capacityWomen;
  const phone = isDatabaseHall(hall) ? hall.phone : undefined;
  const whatsappEnabled = isDatabaseHall(hall) ? hall.whatsapp_enabled : false;
  const rating = isDatabaseHall(hall) ? undefined : hall.rating;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`مرحباً، أرغب في الاستفسار عن قاعة ${hallName}`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
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
        
        {/* Rating (only for mock data) */}
        {rating && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
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
      <div className="p-4 space-y-4">
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
        
        {/* WhatsApp Button */}
        {whatsappEnabled && phone && (
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-arabic">تواصل عبر واتساب</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
