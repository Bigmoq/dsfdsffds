import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, MapPin, Users, Trash2, Star, Sparkles, Tag, Building2, Scissors, Shirt, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useServiceFavorites } from "@/hooks/useServiceFavorites";
import { useDressFavorites } from "@/hooks/useDressFavorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HallDetailsSheet } from "./HallDetailsSheet";
import { VendorDetailsSheet } from "./VendorDetailsSheet";
import { DressDetailsSheet } from "./DressDetailsSheet";
import { womenCategories, menCategories } from "@/data/weddingData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];
type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];
type Dress = Database["public"]["Tables"]["dresses"]["Row"];

// Combine all categories for lookup
const allCategories = [...womenCategories, ...menCategories];

type TabType = 'halls' | 'services' | 'dresses';

const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'halls', label: 'القاعات', icon: Building2 },
  { id: 'services', label: 'الخدمات', icon: Scissors },
  { id: 'dresses', label: 'الفساتين', icon: Shirt },
];

export function FavoritesScreen() {
  const { user } = useAuth();
  const { favorites: hallFavorites, loading: hallFavLoading, toggleFavorite: toggleHallFavorite } = useFavorites();
  const { favorites: serviceFavorites, loading: serviceFavLoading, toggleFavorite: toggleServiceFavorite } = useServiceFavorites();
  const { favorites: dressFavorites, loading: dressFavLoading, toggleFavorite: toggleDressFavorite } = useDressFavorites();
  
  const [activeTab, setActiveTab] = useState<TabType>('halls');
  const [halls, setHalls] = useState<Hall[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedHall, setSelectedHall] = useState<any>(null);
  const [hallSheetOpen, setHallSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);
  const [selectedDress, setSelectedDress] = useState<any>(null);
  const [dressSheetOpen, setDressSheetOpen] = useState(false);

  // Fetch halls
  useEffect(() => {
    if (hallFavorites.length > 0 && !hallFavLoading) {
      fetchFavoriteHalls();
    } else if (!hallFavLoading) {
      setHalls([]);
      if (activeTab === 'halls') setLoading(false);
    }
  }, [hallFavorites, hallFavLoading]);

  // Fetch services
  useEffect(() => {
    if (serviceFavorites.length > 0 && !serviceFavLoading) {
      fetchFavoriteServices();
    } else if (!serviceFavLoading) {
      setServices([]);
      if (activeTab === 'services') setLoading(false);
    }
  }, [serviceFavorites, serviceFavLoading]);

  // Fetch dresses
  useEffect(() => {
    if (dressFavorites.length > 0 && !dressFavLoading) {
      fetchFavoriteDresses();
    } else if (!dressFavLoading) {
      setDresses([]);
      if (activeTab === 'dresses') setLoading(false);
    }
  }, [dressFavorites, dressFavLoading]);

  const fetchFavoriteHalls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("halls")
        .select("*")
        .in("id", hallFavorites)
        .eq("is_active", true);

      if (error) throw error;
      setHalls(data || []);
    } catch (error) {
      console.error("Error fetching favorite halls:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .in("id", serviceFavorites)
        .eq("is_active", true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching favorite services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteDresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dresses")
        .select("*")
        .in("id", dressFavorites)
        .eq("is_active", true)
        .eq("is_sold", false);

      if (error) throw error;
      setDresses(data || []);
    } catch (error) {
      console.error("Error fetching favorite dresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHallClick = (hall: Hall) => {
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
    setHallSheetOpen(true);
  };

  const handleServiceClick = (service: ServiceProvider) => {
    const serviceData = {
      id: service.id,
      nameAr: service.name_ar,
      name: service.name_en,
      descriptionAr: service.description,
      rating: Number(service.rating) || 0,
      reviews: service.reviews_count || 0,
      city: service.city,
      phone: service.phone,
      portfolio_images: service.portfolio_images,
    };
    setSelectedService(serviceData);
    setServiceSheetOpen(true);
  };

  const handleDressClick = (dress: Dress) => {
    const dressData = {
      id: dress.id,
      title: dress.title,
      price: dress.price,
      size: dress.size,
      city: dress.city,
      phone: "", // Will need to fetch seller info
      sellerName: "البائعة",
      description: dress.description || "",
      images: dress.images || ["/placeholder.svg"],
    };
    setSelectedDress(dressData);
    setDressSheetOpen(true);
  };

  const getTotalCount = () => {
    return hallFavorites.length + serviceFavorites.length + dressFavorites.length;
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'halls': return hallFavorites.length;
      case 'services': return serviceFavorites.length;
      case 'dresses': return dressFavorites.length;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'halls': return loading || hallFavLoading;
      case 'services': return loading || serviceFavLoading;
      case 'dresses': return loading || dressFavLoading;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              المفضلة
            </h1>
          </motion.div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h2 className="font-display text-xl font-bold text-foreground mb-2 text-center">
            سجل دخولك
          </h2>
          <p className="text-muted-foreground font-arabic text-center">
            سجل دخولك لحفظ القاعات والخدمات والفساتين المفضلة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full gold-gradient flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            المفضلة
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            {getTotalCount() > 0 ? `${getTotalCount()} عنصر محفوظ` : "احفظ ما يعجبك هنا"}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-arabic text-sm transition-all relative ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </div>
                {count > 0 && (
                  <Badge 
                    className={`absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] ${
                      isActive ? 'bg-background text-primary' : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {count}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading() ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'halls' && (
              <HallsFavorites 
                halls={halls} 
                onHallClick={handleHallClick}
                onRemove={toggleHallFavorite}
              />
            )}
            {activeTab === 'services' && (
              <ServicesFavorites 
                services={services} 
                onServiceClick={handleServiceClick}
                onRemove={toggleServiceFavorite}
              />
            )}
            {activeTab === 'dresses' && (
              <DressesFavorites 
                dresses={dresses} 
                onDressClick={handleDressClick}
                onRemove={toggleDressFavorite}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sheets */}
      <HallDetailsSheet
        hall={selectedHall}
        open={hallSheetOpen}
        onOpenChange={setHallSheetOpen}
      />
      <VendorDetailsSheet
        vendor={selectedService}
        open={serviceSheetOpen}
        onOpenChange={setServiceSheetOpen}
      />
      <DressDetailsSheet
        dress={selectedDress}
        open={dressSheetOpen}
        onClose={() => setDressSheetOpen(false)}
      />
    </div>
  );
}

// Halls Favorites Component
function HallsFavorites({ 
  halls, 
  onHallClick, 
  onRemove 
}: { 
  halls: Hall[]; 
  onHallClick: (hall: Hall) => void;
  onRemove: (id: string) => void;
}) {
  if (halls.length === 0) {
    return <EmptyState icon={Building2} title="لا توجد قاعات مفضلة" message="اضغط على أيقونة القلب في أي قاعة لإضافتها هنا" />;
  }

  return (
    <div className="p-4 space-y-4">
      {halls.map((hall, index) => (
        <motion.div
          key={hall.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="card-luxe rounded-2xl overflow-hidden"
        >
          <div 
            className="relative cursor-pointer"
            onClick={() => onHallClick(hall)}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={hall.cover_image || "/placeholder.svg"}
                alt={hall.name_ar}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 gold-gradient px-3 py-1.5 rounded-full shadow-lg">
                <span className="text-sm font-bold text-white">
                  SAR {hall.price_weekday?.toLocaleString()}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(hall.id);
                }}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </button>

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
                    onRemove(hall.id);
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
  );
}

// Services Favorites Component - Grouped by Category
function ServicesFavorites({ 
  services, 
  onServiceClick, 
  onRemove 
}: { 
  services: ServiceProvider[]; 
  onServiceClick: (service: ServiceProvider) => void;
  onRemove: (id: string) => void;
}) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, { category: typeof allCategories[0] | null; services: ServiceProvider[] }> = {};
    
    services.forEach(service => {
      const categoryId = service.category_id;
      if (!groups[categoryId]) {
        const categoryInfo = allCategories.find(c => c.id === categoryId);
        groups[categoryId] = {
          category: categoryInfo || null,
          services: []
        };
      }
      groups[categoryId].services.push(service);
    });
    
    return groups;
  }, [services]);

  // Initialize all categories as open
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    Object.keys(groupedServices).forEach(key => {
      initialState[key] = true;
    });
    setOpenCategories(initialState);
  }, [groupedServices]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (services.length === 0) {
    return <EmptyState icon={Scissors} title="لا توجد خدمات مفضلة" message="اضغط على أيقونة القلب في أي خدمة لإضافتها هنا" />;
  }

  return (
    <div className="p-4 space-y-4">
      {Object.entries(groupedServices).map(([categoryId, { category, services: categoryServices }], groupIndex) => {
        const Icon = category?.icon || Scissors;
        const isOpen = openCategories[categoryId] ?? true;
        
        return (
          <motion.div
            key={categoryId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="overflow-hidden"
          >
            <Collapsible open={isOpen} onOpenChange={() => toggleCategory(categoryId)}>
              {/* Category Header */}
              <CollapsibleTrigger asChild>
                <button className={`w-full flex items-center justify-between p-4 rounded-2xl mb-2 transition-all ${
                  category ? `bg-gradient-to-r ${category.color} text-white` : 'bg-muted'
                }`}>
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {categoryServices.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-lg">
                      {category?.nameAr || categoryId}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              
              {/* Services List */}
              <CollapsibleContent>
                <div className="space-y-3 pr-2">
                  {categoryServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card-luxe rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => onServiceClick(service)}
                    >
                      <div className="flex gap-3 p-3">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={service.portfolio_images?.[0] || "/placeholder.svg"}
                            alt={service.name_ar}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <h3 className="font-display text-base font-bold text-foreground mb-1 truncate">
                            {service.name_ar}
                          </h3>
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-sm font-semibold">{Number(service.rating)?.toFixed(1) || '0.0'}</span>
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {service.city && (
                              <>
                                <span className="text-muted-foreground text-xs">•</span>
                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                  <span>{service.city}</span>
                                  <MapPin className="w-3 h-3" />
                                </div>
                              </>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-1 font-arabic">
                            {service.description}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(service.id);
                          }}
                          className="self-center w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        );
      })}
    </div>
  );
}

// Dresses Favorites Component
function DressesFavorites({ 
  dresses, 
  onDressClick, 
  onRemove 
}: { 
  dresses: Dress[]; 
  onDressClick: (dress: Dress) => void;
  onRemove: (id: string) => void;
}) {
  if (dresses.length === 0) {
    return <EmptyState icon={Shirt} title="لا توجد فساتين مفضلة" message="اضغط على أيقونة القلب في أي فستان لإضافته هنا" />;
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {dresses.map((dress, index) => {
        const isNew = dress.condition === 'new';
        
        return (
          <motion.div
            key={dress.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/30 cursor-pointer group relative"
            onClick={() => onDressClick(dress)}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={dress.images?.[0] || "/placeholder.svg"}
                alt={dress.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                isNew 
                  ? "bg-emerald-500 text-white" 
                  : "bg-amber-500 text-white"
              }`}>
                {isNew ? <Sparkles className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                {isNew ? "جديد" : "مستعمل"}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(dress.id);
                }}
                className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </button>
              
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
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  message 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <Icon className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      
      <h2 className="font-display text-xl font-bold text-foreground mb-2 text-center">
        {title}
      </h2>
      <p className="text-muted-foreground font-arabic text-center max-w-xs text-sm">
        {message}
      </p>
    </div>
  );
}
