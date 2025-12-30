import { motion } from "framer-motion";
import { Star, MessageCircle, MapPin, Heart, Package, CheckCircle } from "lucide-react";
import { Vendor } from "@/data/weddingData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";

interface ExtendedVendor extends Vendor {
  city?: string;
  phone?: string;
  portfolio_images?: string[];
  packagesCount?: number;
  isAvailableToday?: boolean;
  minPrice?: number;
}

interface VendorCardProps {
  vendor: ExtendedVendor;
  index: number;
  onClick?: () => void;
}

export function VendorCard({ vendor, index, onClick }: VendorCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const images = vendor.portfolio_images?.length 
    ? vendor.portfolio_images.slice(0, 5) 
    : [vendor.image];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = vendor.phone || '966500000000';
    const message = encodeURIComponent(`مرحباً، أرغب في الاستفسار عن خدماتكم - ${vendor.nameAr}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-luxe rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Image Gallery */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, imgIndex) => (
            <div 
              key={imgIndex} 
              className="w-full h-40 flex-shrink-0 snap-center"
            >
              <img 
                src={img} 
                alt={vendor.nameAr}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === 0 ? 'bg-primary w-4' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            isLiked 
              ? "bg-white" 
              : "bg-black/30 backdrop-blur-sm"
          }`}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isLiked 
                ? "text-rose-500 fill-rose-500" 
                : "text-white"
            }`} 
          />
        </button>

        {/* Availability Badge */}
        {vendor.isAvailableToday && (
          <Badge 
            className="absolute top-3 left-3 bg-green-500 text-white border-0 text-xs gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            متاح اليوم
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 text-right">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm font-semibold text-foreground">{vendor.rating?.toFixed(1) || '0.0'}</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground truncate">
            {vendor.nameAr}
          </h3>
        </div>
        
        <div className="flex items-center justify-end gap-3 mb-2 text-sm text-muted-foreground">
          {vendor.packagesCount && vendor.packagesCount > 0 && (
            <div className="flex items-center gap-1">
              <span>{vendor.packagesCount} باقات</span>
              <Package className="w-3.5 h-3.5" />
            </div>
          )}
          {vendor.city && (
            <div className="flex items-center gap-1">
              <span>{vendor.city}</span>
              <MapPin className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground font-arabic line-clamp-1 mb-3">
          {vendor.descriptionAr}
        </p>
        
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <Button 
            size="sm" 
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs px-4 h-9"
          >
            <MessageCircle className="w-3.5 h-3.5 ml-1.5" />
            تواصل
          </Button>
          
          <div className="text-right">
            {vendor.minPrice ? (
              <>
                <span className="text-xs text-muted-foreground">يبدأ من</span>
                <span className="text-base font-bold text-primary mr-1">
                  {vendor.minPrice.toLocaleString()} ر.س
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary">{vendor.price}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}