import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Calendar, Users } from "lucide-react";
import { weddingHalls, cities } from "@/data/weddingData";
import { HallCard } from "./HallCard";
import { Button } from "@/components/ui/button";

export function HomeScreen() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredHalls = selectedCity === "all" 
    ? weddingHalls 
    : weddingHalls.filter(h => h.city.toLowerCase() === selectedCity);

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
              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                <input
                  type="text"
                  placeholder="ابحث عن قاعة..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-right font-arabic text-sm outline-none"
                  dir="rtl"
                />
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl border-border"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Filters */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showFilters ? "auto" : 0, 
          opacity: showFilters ? 1 : 0 
        }}
        className="overflow-hidden bg-card border-b border-border"
      >
        <div className="p-4 space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              <span className="font-arabic">التاريخ</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
              <Users className="w-4 h-4" />
              <span className="font-arabic">السعة</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-arabic">السعر</span>
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* City Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
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
        
        <div className="space-y-4">
          {filteredHalls.map((hall, index) => (
            <HallCard key={hall.id} hall={hall} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
