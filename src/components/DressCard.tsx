import { MapPin, Sparkles, Tag, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Dress } from "@/data/weddingData";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface DressCardProps {
  dress: Dress & { condition?: string; created_at?: string };
  onClick: () => void;
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ar });
  } catch {
    return "";
  }
}

export function DressCard({ dress, onClick }: DressCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const isNew = dress.condition === 'new';
  const timeAgo = getTimeAgo((dress as any).created_at);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/30 cursor-pointer group"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={dress.images[0]}
          alt={dress.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Condition Badge */}
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
          isNew 
            ? "bg-emerald-500 text-white" 
            : "bg-amber-500 text-white"
        }`}>
          {isNew ? <Sparkles className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
          {isNew ? "جديد" : "مستعمل"}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLiked 
              ? "bg-white" 
              : "bg-black/30 backdrop-blur-sm hover:bg-white/80"
          }`}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isLiked 
                ? "text-rose-500 fill-rose-500" 
                : "text-white hover:text-rose-500"
            }`} 
          />
        </button>
        
        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 gold-gradient px-2.5 py-1 rounded-full shadow-lg">
          <span className="text-xs font-bold text-white">
            {dress.price.toLocaleString()} ر.س
          </span>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="font-arabic font-semibold text-foreground text-sm line-clamp-1 text-right">
          {dress.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
            {dress.size}
          </span>
          <span className="flex items-center gap-1">
            {dress.city}
            <MapPin className="w-3 h-3" />
          </span>
        </div>
        {timeAgo && (
          <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground/70">
            <span>{timeAgo}</span>
            <Clock className="w-3 h-3" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
