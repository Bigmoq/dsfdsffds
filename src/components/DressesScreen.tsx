import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Plus, Search, SlidersHorizontal, Sparkles, Tag, ArrowUpDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DressCard } from "./DressCard";
import { DressDetailsSheet } from "./DressDetailsSheet";
import { SellDressSheet } from "./SellDressSheet";
import { DressFilterSheet, DressFilters } from "./DressFilterSheet";
import { Badge } from "@/components/ui/badge";
import { usePaginatedQuery, useInfiniteScroll, InfiniteScrollTrigger } from "@/hooks/usePaginatedQuery";
import { DressCardSkeleton } from "@/components/skeletons";
import { PullToRefresh } from "./PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ConditionTab = "all" | "new" | "used";
type CategoryTab = "all" | "wedding" | "evening" | "maternity";
type SortOption = "newest" | "oldest" | "price_low" | "price_high";

const PAGE_SIZE = 20;

const sortOptions: { id: SortOption; label: string }[] = [
  { id: "newest", label: "الأحدث" },
  { id: "oldest", label: "الأقدم" },
  { id: "price_low", label: "السعر: من الأقل" },
  { id: "price_high", label: "السعر: من الأعلى" },
];

const categoryTabs: { id: CategoryTab; label: string; icon: string }[] = [
  { id: "all", label: "الكل", icon: "👗" },
  { id: "wedding", label: "زواج", icon: "👰" },
  { id: "evening", label: "سهرة", icon: "✨" },
  { id: "maternity", label: "حمل", icon: "🤰" },
];

export function DressesScreen() {
  const [selectedDress, setSelectedDress] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSellSheet, setShowSellSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<ConditionTab>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<DressFilters>({
    city: "",
    size: "",
    priceRange: [0, 10000]
  });
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll handler for FAB visibility - uses window scroll since that's what happens in the current layout
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsButtonVisible(false);
      } else {
        setIsButtonVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Build query filters
  // Note: Using public_dresses view which already filters is_active=true AND is_sold=false
  const queryFilters = useMemo(() => {
    const f: Record<string, any> = {};
    
    if (selectedCondition !== "all") {
      f.condition = selectedCondition;
    }
    
    if (selectedCategory !== "all") {
      f.category = selectedCategory;
    }
    
    if (selectedCity !== "all") {
      f.city = selectedCity;
    }
    
    if (filters.city) {
      f.city = filters.city;
    }
    
    if (filters.size) {
      f.size = filters.size;
    }
    
    return f;
  }, [selectedCondition, selectedCategory, selectedCity, filters.city, filters.size]);

  // Determine sort order
  const orderBy = useMemo(() => {
    switch (sortBy) {
      case "oldest":
        return { column: 'created_at', ascending: true };
      case "price_low":
        return { column: 'price', ascending: true };
      case "price_high":
        return { column: 'price', ascending: false };
      default:
        return { column: 'created_at', ascending: false };
    }
  }, [sortBy]);

  // Fetch dresses with pagination
  const {
    data: dbDresses,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  } = usePaginatedQuery<any>({
    queryKey: ['dresses-paginated'],
    tableName: 'public_dresses', // Secure view that excludes sold/inactive dresses
    pageSize: PAGE_SIZE,
    orderBy,
    filters: queryFilters,
    select: '*',
  });

  // Set up infinite scroll
  const loadMoreRef = useInfiniteScroll(
    useCallback(() => fetchNextPage(), [fetchNextPage]),
    hasNextPage,
    isFetchingNextPage
  );

  // Client-side filtering for search and price range
  const filteredDresses = useMemo(() => {
    return dbDresses.filter((dress) => {
      // Search filter
      if (searchQuery) {
        const matchesSearch = dress.title.includes(searchQuery) || dress.city.includes(searchQuery);
        if (!matchesSearch) return false;
      }
      
      // Price filter
      const matchesPrice = dress.price >= filters.priceRange[0] && dress.price <= filters.priceRange[1];
      if (!matchesPrice) return false;
      
      return true;
    });
  }, [dbDresses, searchQuery, filters.priceRange]);

  const activeFiltersCount = [
    filters.city,
    filters.size,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000
  ].filter(Boolean).length;

  const handleDressClick = (dress: any) => {
    setSelectedDress(dress);
    setShowDetails(true);
  };

  const conditionTabs: { id: ConditionTab; label: string; icon: any }[] = [
    { id: "all", label: "الكل", icon: null },
    { id: "new", label: "جديد", icon: Sparkles },
    { id: "used", label: "مستعمل", icon: Tag },
  ];

  const quickCities = ["all", "الرياض", "جدة", "مكة المكرمة", "الدمام"];

  const queryClient = useQueryClient();
  
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['dresses-paginated'] });
  }, [queryClient]);

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
        <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="bg-gradient-to-b from-pink-500/10 via-primary/5 to-background pt-12 pb-6 px-4">
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
          <div className="relative max-w-md mx-auto mb-4">
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

          {/* Category Tabs */}
          <div className="flex justify-center gap-2 mb-4">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-2 rounded-full text-sm font-arabic flex items-center gap-1.5 transition-all ${
                  selectedCategory === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Condition Tabs */}
          <div className="flex justify-center gap-2 mb-4">
            {conditionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCondition(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-arabic flex items-center gap-1 transition-all ${
                  selectedCondition === tab.id
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.icon && <tab.icon className="w-3 h-3" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick City Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {quickCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-full text-xs font-arabic whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {city === "all" ? "كل المدن" : city}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="px-4 py-3 flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              <span className="font-arabic">{sortOptions.find(o => o.id === sortBy)?.label}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="font-arabic">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={sortBy === option.id ? "bg-muted" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Badge variant="secondary" className="font-arabic">
            {filteredDresses.length} {totalCount > filteredDresses.length ? `من ${totalCount}` : ''} فستان
          </Badge>
        </div>

        {/* Dresses Grid */}
        <div className="px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <DressCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredDresses.length > 0 ? (
            <>
              <motion.div 
                className="grid grid-cols-2 gap-4"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredDresses.map((dress) => (
                    <motion.div
                      key={dress.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DressCard
                        dress={dress as any}
                        onClick={() => handleDressClick(dress)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Infinite Scroll Trigger */}
              <InfiniteScrollTrigger
                loadMoreRef={loadMoreRef}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-arabic mb-2">
                لا توجد نتائج للبحث
              </p>
              <p className="text-sm text-muted-foreground/70 font-arabic">
                جربي تغيير معايير البحث
              </p>
            </div>
          )}
        </div>
        </div>
      </PullToRefresh>

      {/* FAB - Sell Your Dress - OUTSIDE PullToRefresh */}
      <motion.button
        initial={{ scale: 1, opacity: 1 }}
        animate={{ 
          scale: isButtonVisible ? 1 : 0, 
          opacity: isButtonVisible ? 1 : 0,
          y: isButtonVisible ? 0 : 20
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => setShowSellSheet(true)}
        className="fixed bottom-44 left-4 gold-gradient text-white w-11 h-11 rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <Plus className="w-5 h-5" />
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
    </>
  );
}
