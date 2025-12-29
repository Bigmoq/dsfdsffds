import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { womenCategories, menCategories, vendors, ServiceCategory } from "@/data/weddingData";
import { CategoryCard } from "./CategoryCard";
import { VendorCard } from "./VendorCard";

type Tab = "women" | "men";

export function ServicesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("women");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = activeTab === "women" ? womenCategories : menCategories;
  
  const filteredCategories = categories.filter(cat => 
    cat.nameAr.includes(searchQuery) || cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryVendors = selectedCategory 
    ? vendors.filter(v => v.categoryId === selectedCategory.id)
    : [];

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="px-4 pt-12 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              {selectedCategory ? selectedCategory.nameAr : "خدمات الزفاف"}
            </h1>
            <p className="text-secondary-foreground/80 font-arabic text-sm">
              {selectedCategory 
                ? `استعرض مقدمي خدمة ${selectedCategory.nameAr}`
                : "اكتشف أفضل مقدمي خدمات الأفراح"
              }
            </p>
          </motion.div>
          
          {selectedCategory && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors mb-4"
            >
              <span className="font-arabic text-sm">العودة للخدمات</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Tabs - Only show when not viewing category */}
        {!selectedCategory && (
          <div className="px-4 pb-4">
            <div className="flex bg-secondary-foreground/10 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("women")}
                className={`flex-1 py-3 px-4 rounded-xl font-arabic text-sm font-semibold transition-all duration-300 ${
                  activeTab === "women"
                    ? "bg-card text-foreground shadow-lg"
                    : "text-secondary-foreground/70 hover:text-secondary-foreground"
                }`}
              >
                👩 خدمات النساء
              </button>
              <button
                onClick={() => setActiveTab("men")}
                className={`flex-1 py-3 px-4 rounded-xl font-arabic text-sm font-semibold transition-all duration-300 ${
                  activeTab === "men"
                    ? "bg-card text-foreground shadow-lg"
                    : "text-secondary-foreground/70 hover:text-secondary-foreground"
                }`}
              >
                👨 خدمات الرجال
              </button>
            </div>
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
            className="p-4 space-y-4"
          >
            {categoryVendors.length > 0 ? (
              categoryVendors.map((vendor, index) => (
                <VendorCard key={vendor.id} vendor={vendor} index={index} />
              ))
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
            className="p-4"
          >
            {/* Search */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                <input
                  type="text"
                  placeholder="ابحث عن خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-right font-arabic text-sm outline-none"
                  dir="rtl"
                />
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            
            {/* Categories Count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-arabic">
                {filteredCategories.length} خدمة
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">
                {activeTab === "women" ? "خدمات النساء" : "خدمات الرجال"}
              </h2>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
