import { motion } from "framer-motion";
import { Star, MessageCircle, MapPin, Heart } from "lucide-react";
import { Vendor } from "@/data/weddingData";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface VendorCardProps {
  vendor: Vendor & { city?: string; phone?: string };
  index: number;
}

export function VendorCard({ vendor, index }: VendorCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = (vendor as any).phone || '966500000000';
    const message = encodeURIComponent(`مرحباً، أرغب في الاستفسار عن خدماتكم - ${vendor.nameAr}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-luxe rounded-2xl overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={vendor.image} 
            alt={vendor.nameAr}
            className="w-full h-full object-cover"
          />
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isLiked 
                ? "bg-white" 
                : "bg-black/30 backdrop-blur-sm"
            }`}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked 
                  ? "text-rose-500 fill-rose-500" 
                  : "text-white"
              }`} 
            />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between text-right min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">{vendor.rating}</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground truncate">
                {vendor.nameAr}
              </h3>
            </div>
            
            {(vendor as any).city && (
              <div className="flex items-center gap-1 justify-end mt-1 text-muted-foreground">
                <span className="text-xs">{(vendor as any).city}</span>
                <MapPin className="w-3 h-3" />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground font-arabic line-clamp-1 mt-1">
              {vendor.descriptionAr}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-2 gap-2">
            <Button 
              size="sm" 
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs px-3 h-8"
            >
              <MessageCircle className="w-3.5 h-3.5 ml-1" />
              تواصل
            </Button>
            
            <span className="text-sm font-bold text-primary truncate">{vendor.price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
