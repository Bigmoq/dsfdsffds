import { MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Dress } from "@/data/weddingData";

interface DressCardProps {
  dress: Dress;
  onClick: () => void;
}

export function DressCard({ dress, onClick }: DressCardProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`مرحباً، أنا مهتمة بالفستان: ${dress.title}`);
    window.open(`https://wa.me/${dress.phone}?text=${message}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 cursor-pointer group"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={dress.images[0]}
          alt={dress.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
          {dress.price.toLocaleString()} ر.س
        </div>
        <button
          onClick={handleWhatsApp}
          className="absolute bottom-2 left-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="font-arabic font-semibold text-foreground text-sm line-clamp-1">
          {dress.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="bg-secondary px-2 py-0.5 rounded-full">
            مقاس: {dress.size}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {dress.city}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
