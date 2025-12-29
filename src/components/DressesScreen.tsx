import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DressCard } from "./DressCard";
import { DressDetailsSheet } from "./DressDetailsSheet";
import { SellDressSheet } from "./SellDressSheet";
import { DressFilterSheet, DressFilters } from "./DressFilterSheet";
import { mockDresses, Dress } from "@/data/weddingData";

export function DressesScreen() {
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSellSheet, setShowSellSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DressFilters>({
    city: "",
    size: "",
    priceRange: [0, 10000]
  });

  const filteredDresses = mockDresses.filter((dress) => {
    // Search filter
    const matchesSearch = dress.title.includes(searchQuery) || dress.city.includes(searchQuery);
    
    // City filter
    const matchesCity = !filters.city || dress.city === filters.city;
    
    // Size filter
    const matchesSize = !filters.size || dress.size === filters.size;
    
    // Price filter
    const matchesPrice = dress.price >= filters.priceRange[0] && dress.price <= filters.priceRange[1];
    
    return matchesSearch && matchesCity && matchesSize && matchesPrice;
  });

  const activeFiltersCount = [
    filters.city,
    filters.size,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000
  ].filter(Boolean).length;

  const handleDressClick = (dress: Dress) => {
    setSelectedDress(dress);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-12 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            سوق الفساتين
          </h1>
          <p className="text-muted-foreground text-sm font-arabic">
            اعرضي فستانك أو اعثري على فستان أحلامك
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحثي عن فستان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-10 py-5 rounded-xl bg-card border-border/50 text-right"
          />
          <button 
            onClick={() => setShowFilterSheet(true)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground relative"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dresses Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredDresses.map((dress) => (
            <DressCard
              key={dress.id}
              dress={dress}
              onClick={() => handleDressClick(dress)}
            />
          ))}
        </div>

        {filteredDresses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-arabic">
              لا توجد نتائج للبحث
            </p>
          </div>
        )}
      </div>

      {/* FAB - Sell Your Dress */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSellSheet(true)}
        className="fixed bottom-28 left-4 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Dress Details Sheet */}
      <DressDetailsSheet
        dress={selectedDress}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      {/* Sell Dress Sheet */}
      <SellDressSheet
        open={showSellSheet}
        onClose={() => setShowSellSheet(false)}
      />

      {/* Filter Sheet */}
      <DressFilterSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
}