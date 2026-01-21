import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Sparkles, Users, SlidersHorizontal, Loader2 } from "lucide-react";
import { womenCategories, menCategories, ServiceCategory } from "@/data/weddingData";
import { CategoryCard } from "./CategoryCard";
import { VendorCard } from "./VendorCard";
import { VendorDetailsSheet } from "./VendorDetailsSheet";
import { VendorFilterSheet, VendorFilters, defaultFilters } from "./VendorFilterSheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaginatedQuery, useInfiniteScroll, InfiniteScrollTrigger } from "@/hooks/usePaginatedQuery";
import { format, startOfToday } from "date-fns";
import { VendorCardSkeleton } from "@/components/skeletons";
import { PullToRefresh } from "./PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

type Tab = "women" | "men";

const PAGE_SIZE = 15;

export function ServicesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("women");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VendorFilters>(defaultFilters);

  // Build query filters
  const queryFilters = useMemo(() => {
    const f: Record<string, any> = { is_active: true };
    
    if (selectedCategory) {
      f.category_id = selectedCategory.id;
    }
    
    if (filters.city) {
      f.city = filters.city;
    }
    
    return f;
  }, [selectedCategory, filters.city]);

  // Fetch service providers with pagination
  const {
    data: dbProviders,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  } = usePaginatedQuery<any>({
    queryKey: ['service-providers-paginated'],
    tableName: 'service_providers',
    pageSize: PAGE_SIZE,
    orderBy: { column: 'rating', ascending: false },
    filters: queryFilters,
    select: '*',
    enabled: !!selectedCategory,
  });

  // Set up infinite scroll
  const loadMoreRef = useInfiniteScroll(
    useCallback(() => fetchNextPage(), [fetchNextPage]),
    hasNextPage,
    isFetchingNextPage
  );

  const categories = activeTab === "women" ? womenCategories : menCategories;
  
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.nameAr.includes(searchQuery) || cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Get unique cities for filter
  const availableCities = useMemo(() => {
    const cities = new Set(dbProviders.map(p => p.city).filter(Boolean));
    return Array.from(cities) as string[];
  }, [dbProviders]);

  // Process and filter vendors
  const allVendors = useMemo(() => {
    const normalizedDbProviders = dbProviders.map(p => {
      return {
        id: p.id,
        name: p.name_en || p.name_ar,
        nameAr: p.name_ar,
        categoryId: p.category_id,
        rating: Number(p.rating) || 0,
        reviews: p.reviews_count || 0,
        price: 'اتصل للسعر',
        minPrice: null,
        image: p.portfolio_images?.[0] || '/placeholder.svg',
        portfolio_images: p.portfolio_images,
        description: p.description || '',
        descriptionAr: p.description || '',
        city: p.city,
        phone: p.phone,
        packagesCount: 0,
        isAvailableToday: false,
        isFromDb: true,
      };
    });

    // Apply client-side filters
    let filtered = normalizedDbProviders.filter(v => {
      if (filters.minRating > 0 && v.rating < filters.minRating) return false;
      if (searchQuery && !v.nameAr.includes(searchQuery) && !v.descriptionAr?.includes(searchQuery)) return false;
      return true;
    });

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
        break;
    }

    return filtered;
  }, [dbProviders, filters, searchQuery]);

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setFilters(defaultFilters);
  };

  const activeFiltersCount = [
    filters.city,
    filters.minRating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 50000,
    filters.availableToday,
  ].filter(Boolean).length;

  const tabOptions = [
    { id: "women" as Tab, label: "خدمات النساء", icon: Sparkles, emoji: "👩" },
    { id: "men" as Tab, label: "خدمات الرجال", icon: Users, emoji: "👨" },
  ];

  const queryClient = useQueryClient();
  
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['service-providers-paginated'] });
  }, [queryClient]);

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
      <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary/80 via-secondary/40 to-background pt-12 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {selectedCategory ? (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 mx-auto"
              >
                <span className="font-arabic text-sm">العودة للخدمات</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                {selectedCategory.nameAr}
              </h1>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                خدمات الزفاف
              </h1>
              <p className="text-muted-foreground font-arabic text-sm">
                اكتشف أفضل مقدمي خدمات الأفراح
              </p>
            </>
          )}
        </motion.div>
        
        {/* Search & Filter Bar */}
        <div className="flex gap-2 max-w-md mx-auto mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={selectedCategory ? "ابحث عن مقدم خدمة..." : "ابحث عن خدمة..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 py-5 rounded-xl bg-card border-border/50 text-right"
            />
          </div>
          {selectedCategory && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(true)}
              className="h-12 w-12 rounded-xl relative"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Tabs */}
        {!selectedCategory && (
          <div className="flex justify-center gap-2">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-arabic flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-md"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key="vendors"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="px-4 py-4"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="font-arabic">
                {allVendors.length} {totalCount > allVendors.length ? `من ${totalCount}` : ''} مقدم خدمة
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </div>
            ) : allVendors.length > 0 ? (
              <div className="space-y-4">
                {allVendors.map((vendor, index) => (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={vendor as any} 
                    index={index}
                    onClick={() => setSelectedVendor(vendor)}
                  />
                ))}
                
                {/* Infinite Scroll Trigger */}
                <InfiniteScrollTrigger
                  loadMoreRef={loadMoreRef}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">🔜</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-muted-foreground font-arabic text-sm">
                  جرب تغيير الفلاتر أو البحث بكلمات مختلفة
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-4"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="font-arabic">
                {filteredCategories.length} خدمة
              </Badge>
            </div>
            
            <motion.div className="grid grid-cols-3 sm:grid-cols-4 gap-3" layout>
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CategoryCard
                      category={category}
                      index={index}
                      onClick={() => setSelectedCategory(category)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-arabic">لا توجد نتائج</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Details Sheet */}
      <VendorDetailsSheet
        open={!!selectedVendor}
        onOpenChange={(open) => !open && setSelectedVendor(null)}
        vendor={selectedVendor}
      />

      {/* Filter Sheet */}
      <VendorFilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
        availableCities={availableCities}
      />
      </div>
    </PullToRefresh>
  );
}
