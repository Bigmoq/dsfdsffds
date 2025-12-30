import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, MapPin, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { HallDetailsSheet } from "./HallDetailsSheet";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];

export function FavoritesScreen() {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchFavoriteHalls();
    } else if (!favoritesLoading) {
      setHalls([]);
      setLoading(false);
    }
  }, [favorites, favoritesLoading]);

  const fetchFavoriteHalls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("halls")
        .select("*")
        .in("id", favorites)
        .eq("is_active", true);

      if (error) throw error;
      setHalls(data || []);
    } catch (error) {
      console.error("Error fetching favorite halls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHallClick = (hall: Hall) => {
    // Convert to WeddingHall format for the sheet
    const hallData = {
      id: hall.id,
      nameAr: hall.name_ar,
      nameEn: hall.name_en || "",
      city: hall.city,
      cityAr: hall.city,
      image: hall.cover_image || "/placeholder.svg",
      price: hall.price_weekday,
      priceWeekend: hall.price_weekend,
      capacityMen: hall.capacity_men,
      capacityWomen: hall.capacity_women,
      rating: 0,
      reviews: 0,
      features: hall.features || [],
      availability: [],
      phone: hall.phone,
      whatsapp_enabled: hall.whatsapp_enabled,
    };
    setSelectedHall(hallData);
    setSheetOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-primary/10 px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              المفضلة
            </h1>
          </motion.div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2 text-center">
            سجل دخولك
          </h2>
          <p className="text-muted-foreground font-arabic text-center">
            سجل دخولك لحفظ القاعات المفضلة
          </p>
        </div>
      </div>
    );
  }

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-primary/10 px-4 pt-12 pb-8">
          <h1 className="font-display text-3xl font-bold text-foreground text-center">
            المفضلة
          </h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary/10 px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            المفضلة
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            {halls.length > 0 ? `${halls.length} قاعة محفوظة` : "قاعاتك المفضلة"}
          </p>
        </motion.div>
      </div>
      
      {halls.length > 0 ? (
        <div className="p-4 space-y-4">
          {halls.map((hall, index) => (
            <motion.div
              key={hall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-luxe rounded-2xl overflow-hidden"
            >
              <div 
                className="relative cursor-pointer"
                onClick={() => handleHallClick(hall)}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={hall.cover_image || "/placeholder.svg"}
                    alt={hall.name_ar}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 left-3 gold-gradient px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-sm font-bold text-white">
                      SAR {hall.price_weekday?.toLocaleString()}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(hall.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  {/* Name Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display text-lg font-bold text-white mb-1 text-right">
                      {hall.name_ar}
                    </h3>
                    <div className="flex items-center gap-1 justify-end text-white/90">
                      <span className="text-sm">{hall.city}</span>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-arabic">رجال {hall.capacity_men}</span>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-arabic">نساء {hall.capacity_women}</span>
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(hall.id);
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      <span className="font-arabic">إزالة</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mb-6 shadow-xl"
          >
            <Heart className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="font-display text-2xl font-bold text-foreground mb-3 text-center">
            لا توجد مفضلات بعد
          </h2>
          <p className="text-muted-foreground font-arabic text-center max-w-xs">
            اضغط على أيقونة القلب في أي قاعة لإضافتها إلى المفضلة
          </p>
        </div>
      )}

      {/* Hall Details Sheet */}
      <HallDetailsSheet
        hall={selectedHall}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
