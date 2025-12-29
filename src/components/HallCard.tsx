import { motion } from "framer-motion";
import { MapPin, Star, Users } from "lucide-react";
import { WeddingHall } from "@/data/weddingData";

interface HallCardProps {
  hall: WeddingHall;
  index: number;
}

export function HallCard({ hall, index }: HallCardProps) {
  const getDayLabel = (idx: number) => {
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    return days[idx];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-luxe rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hall.image} 
          alt={hall.nameAr}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3 gold-gradient px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-sm font-bold text-white">
            SAR {hall.price.toLocaleString()}
          </span>
        </div>
        
        {/* Rating */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 text-resale fill-resale" />
          <span className="text-sm font-semibold text-white">{hall.rating}</span>
        </div>
        
        {/* Hall Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-xl font-bold text-white mb-1 text-right">
            {hall.nameAr}
          </h3>
          <div className="flex items-center gap-1 justify-end text-white/90">
            <span className="text-sm">{hall.cityAr}</span>
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
              <span className="font-arabic">رجال {hall.capacityMen}</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-arabic">نساء {hall.capacityWomen}</span>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">({hall.reviews} تقييم)</span>
        </div>
        
        {/* Availability Strip */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-right font-arabic">
            الأيام المتاحة
          </p>
          <div className="flex items-center justify-between gap-1">
            {hall.availability.map((status, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`availability-dot ${
                  status === 'available' ? 'availability-available' :
                  status === 'booked' ? 'availability-booked' :
                  'availability-resale'
                }`} />
                <span className="text-[10px] text-muted-foreground font-arabic">
                  {getDayLabel(idx)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-available" />
            <span className="text-xs text-muted-foreground font-arabic">متاح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-booked" />
            <span className="text-xs text-muted-foreground font-arabic">محجوز</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-resale" />
            <span className="text-xs text-muted-foreground font-arabic">إعادة بيع</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
