import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import { weddingHalls, cities, WeddingHall } from "@/data/weddingData";
import { HallCard } from "./HallCard";
import { HallDetailsSheet } from "./HallDetailsSheet";
import { HallFilterSheet, HallFilters, defaultFilters } from "./HallFilterSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HomeScreen() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHall, setSelectedHall] = useState<WeddingHall | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<HallFilters>(defaultFilters);

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city !== "all") count++;
    if (filters.minCapacity > 0 || filters.maxCapacity < 2000) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++;
    if (filters.availability !== "all") count++;
    return count;
  }, [filters]);

  // Filter halls based on search and filters
  const filteredHalls = useMemo(() => {
    return weddingHalls.filter((hall) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          hall.name.toLowerCase().includes(query) ||
          hall.nameAr.includes(searchQuery) ||
          hall.city.toLowerCase().includes(query) ||
          hall.cityAr.includes(searchQuery);
        if (!matchesSearch) return false;
      }

      // City filter (from tabs or filter sheet)
      const cityFilter = selectedCity !== "all" ? selectedCity : filters.city;
      if (cityFilter !== "all") {
        if (hall.city.toLowerCase() !== cityFilter) return false;
      }

      // Capacity filter
      const totalCapacity = hall.capacityMen + hall.capacityWomen;
      if (totalCapacity < filters.minCapacity || totalCapacity > filters.maxCapacity) {
        return false;
      }

      // Price filter
      if (hall.price < filters.minPrice || hall.price > filters.maxPrice) {
        return false;
      }

      // Availability filter
      if (filters.availability !== "all") {
        if (!hall.availability.includes(filters.availability)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCity, filters]);

  const handleHallClick = (hall: WeddingHall) => {
    setSelectedHall(hall);
    setSheetOpen(true);
  };

  const handleCityTabClick = (cityId: string) => {
    setSelectedCity(cityId);
    // Sync with filters
    setFilters((prev) => ({ ...prev, city: cityId }));
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gold-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              قاعات الأفراح
            </h1>
            <p className="text-white/80 font-arabic text-sm">
              اكتشف أفضل قاعات الزفاف في المملكة
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 relative">
                <input
                  type="text"
                  placeholder="ابحث عن قاعة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-right font-arabic text-sm outline-none"
                  dir="rtl"
                />
                {searchQuery ? (
                  <button onClick={clearSearch} className="p-1">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                ) : (
                  <Search className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl border-border relative"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs gold-gradient border-0">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* City Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCityTabClick(city.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                selectedCity === city.id
                  ? "gold-gradient text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="font-arabic text-sm">{city.nameAr}</span>
              {city.id !== "all" && <MapPin className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
      
      {/* Halls Grid */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-arabic">
            {filteredHalls.length} قاعة متاحة
          </span>
          <h2 className="font-display text-xl font-bold text-foreground">
            القاعات المميزة
          </h2>
        </div>
        
        {filteredHalls.length > 0 ? (
          <div className="space-y-4">
            {filteredHalls.map((hall, index) => (
              <HallCard 
                key={hall.id} 
                hall={hall} 
                index={index} 
                onClick={() => handleHallClick(hall)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-arabic text-lg mb-2">
              لا توجد قاعات مطابقة
            </p>
            <p className="text-muted-foreground font-arabic text-sm">
              جرب تعديل الفلاتر أو البحث بكلمات مختلفة
            </p>
            <Button
              variant="outline"
              className="mt-4 font-arabic"
              onClick={() => {
                setFilters(defaultFilters);
                setSearchQuery("");
                setSelectedCity("all");
              }}
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>

      {/* Hall Details Sheet */}
      <HallDetailsSheet 
        hall={selectedHall}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Filter Sheet */}
      <HallFilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setSelectedCity(newFilters.city);
        }}
      />
    </div>
  );
}