import { motion } from "framer-motion";
import { Star, MessageCircle } from "lucide-react";
import { Vendor } from "@/data/weddingData";
import { Button } from "@/components/ui/button";

interface VendorCardProps {
  vendor: Vendor;
  index: number;
}

export function VendorCard({ vendor, index }: VendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-luxe rounded-2xl overflow-hidden flex gap-4 p-4"
    >
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={vendor.image} 
          alt={vendor.nameAr}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between text-right">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {vendor.nameAr}
          </h3>
          <p className="text-xs text-muted-foreground font-arabic line-clamp-2">
            {vendor.descriptionAr}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Button 
            size="sm" 
            className="gold-gradient text-white hover:opacity-90 shadow-md"
          >
            <MessageCircle className="w-4 h-4 ml-1" />
            تواصل
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">{vendor.price}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{vendor.rating}</span>
              <Star className="w-4 h-4 text-resale fill-resale" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
