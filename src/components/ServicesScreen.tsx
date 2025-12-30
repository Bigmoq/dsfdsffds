import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Sparkles, Users } from "lucide-react";
import { womenCategories, menCategories, vendors, ServiceCategory } from "@/data/weddingData";
import { CategoryCard } from "./CategoryCard";
import { VendorCard } from "./VendorCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Tab = "women" | "men";

export function ServicesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("women");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch service providers from database
  const { data: dbProviders = [], isLoading } = useQuery({
    queryKey: ['service-providers', selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('service_providers')
        .select('*, service_packages(*)')
        .eq('category_id', selectedCategory.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory,
  });

  const categories = activeTab === "women" ? womenCategories : menCategories;
  
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.nameAr.includes(searchQuery) || cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Combine mock and database vendors
  const allVendors = useMemo(() => {
    const mockVendors = selectedCategory 
      ? vendors.filter(v => v.categoryId === selectedCategory.id)
      : [];
    
    const normalizedDbProviders = dbProviders.map(p => ({
      id: p.id,
      name: p.name_en || p.name_ar,
      nameAr: p.name_ar,
      categoryId: p.category_id,
      rating: Number(p.rating) || 0,
      reviews: p.reviews_count || 0,
      price: p.service_packages?.[0]?.price ? `${p.service_packages[0].price} ر.س` : 'اتصل للسعر',
      image: p.portfolio_images?.[0] || '/placeholder.svg',
      description: p.description || '',
      descriptionAr: p.description || '',
      city: p.city,
      phone: p.phone,
      isFromDb: true,
    }));
    
    return [...normalizedDbProviders, ...mockVendors];
  }, [selectedCategory, dbProviders]);

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const tabOptions = [
    { id: "women" as Tab, label: "خدمات النساء", icon: Sparkles, emoji: "👩" },
    { id: "men" as Tab, label: "خدمات الرجال", icon: Users, emoji: "👨" },
  ];

  return (
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
              <p className="text-muted-foreground font-arabic text-sm">
                اختر من أفضل مقدمي الخدمة
              </p>
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
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={selectedCategory ? "ابحث عن مقدم خدمة..." : "ابحث عن خدمة..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 py-5 rounded-xl bg-card border-border/50 text-right"
          />
        </div>

        {/* Tabs - Only show when not viewing category */}
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
          /* Vendors List */
          <motion.div
            key="vendors"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="px-4 py-4"
          >
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="font-arabic">
                {allVendors.length} مقدم خدمة
              </Badge>
              <span className="text-sm text-muted-foreground font-arabic">
                {selectedCategory.nameAr}
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-arabic">جاري التحميل...</p>
              </div>
            ) : allVendors.length > 0 ? (
              <div className="space-y-4">
                {allVendors.map((vendor, index) => (
                  <VendorCard key={vendor.id} vendor={vendor as any} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">🔜</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  قريباً
                </h3>
                <p className="text-muted-foreground font-arabic text-sm">
                  لا يوجد مقدمي خدمة حالياً في هذه الفئة
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Categories Grid */
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-4"
          >
            {/* Categories Count */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="font-arabic">
                {filteredCategories.length} خدمة
              </Badge>
              <span className="text-sm text-muted-foreground font-arabic">
                {activeTab === "women" ? "خدمات النساء" : "خدمات الرجال"}
              </span>
            </div>
            
            {/* Grid */}
            <motion.div 
              className="grid grid-cols-3 sm:grid-cols-4 gap-3"
              layout
            >
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
                <p className="text-muted-foreground font-arabic">
                  لا توجد نتائج للبحث
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
