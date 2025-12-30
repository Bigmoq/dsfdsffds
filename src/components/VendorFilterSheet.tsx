import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, SlidersHorizontal, MapPin, Star, DollarSign, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export interface VendorFilters {
  city: string | null;
  minRating: number;
  priceRange: [number, number];
  sortBy: 'rating' | 'price_low' | 'price_high' | 'newest';
  availableToday: boolean;
}

interface VendorFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: VendorFilters;
  onFiltersChange: (filters: VendorFilters) => void;
  availableCities: string[];
}

const defaultFilters: VendorFilters = {
  city: null,
  minRating: 0,
  priceRange: [0, 50000],
  sortBy: 'rating',
  availableToday: false,
};

const sortOptions = [
  { id: 'rating' as const, label: 'الأعلى تقييماً' },
  { id: 'price_low' as const, label: 'الأقل سعراً' },
  { id: 'price_high' as const, label: 'الأعلى سعراً' },
  { id: 'newest' as const, label: 'الأحدث' },
];

const ratingOptions = [
  { value: 0, label: 'الكل' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

export function VendorFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableCities,
}: VendorFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<VendorFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    localFilters.city !== null || 
    localFilters.minRating > 0 || 
    localFilters.priceRange[0] > 0 || 
    localFilters.priceRange[1] < 50000 ||
    localFilters.availableToday;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              إعادة تعيين
            </Button>
            <SheetTitle className="font-display text-lg flex items-center gap-2">
              الفلاتر
              <SlidersHorizontal className="w-5 h-5" />
            </SheetTitle>
            <button onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Available Today */}
            <div className="text-right">
              <h3 className="font-bold text-foreground font-arabic mb-3 flex items-center justify-end gap-2">
                متاح اليوم
              </h3>
              <button
                onClick={() => setLocalFilters(f => ({ ...f, availableToday: !f.availableToday }))}
                className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                  localFilters.availableToday
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    localFilters.availableToday ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {localFilters.availableToday && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-primary-foreground rounded-full"
                      />
                    )}
                  </div>
                  <span className="font-arabic">عرض المتاحين اليوم فقط</span>
                </div>
              </button>
            </div>

            <Separator />

            {/* City Filter */}
            <div className="text-right">
              <h3 className="font-bold text-foreground font-arabic mb-3 flex items-center justify-end gap-2">
                المدينة
                <MapPin className="w-4 h-4" />
              </h3>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setLocalFilters(f => ({ ...f, city: null }))}
                  className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                    localFilters.city === null
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  الكل
                </button>
                {availableCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setLocalFilters(f => ({ ...f, city }))}
                    className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                      localFilters.city === city
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rating Filter */}
            <div className="text-right">
              <h3 className="font-bold text-foreground font-arabic mb-3 flex items-center justify-end gap-2">
                التقييم
                <Star className="w-4 h-4" />
              </h3>
              <div className="flex gap-2 justify-end">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalFilters(f => ({ ...f, minRating: option.value }))}
                    className={`px-4 py-2 rounded-full text-sm font-arabic transition-all flex items-center gap-1 ${
                      localFilters.minRating === option.value
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {option.value > 0 && <Star className="w-3 h-3 fill-current" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="text-right">
              <h3 className="font-bold text-foreground font-arabic mb-3 flex items-center justify-end gap-2">
                نطاق السعر
                <DollarSign className="w-4 h-4" />
              </h3>
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  min={0}
                  max={50000}
                  step={500}
                  onValueChange={(value) => 
                    setLocalFilters(f => ({ ...f, priceRange: value as [number, number] }))
                  }
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground font-arabic">
                  <span>{localFilters.priceRange[1].toLocaleString()} ر.س</span>
                  <span>{localFilters.priceRange[0].toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sort By */}
            <div className="text-right">
              <h3 className="font-bold text-foreground font-arabic mb-3">ترتيب حسب</h3>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setLocalFilters(f => ({ ...f, sortBy: option.id }))}
                    className={`w-full p-3 rounded-xl text-right font-arabic transition-all ${
                      localFilters.sortBy === option.id
                        ? 'bg-foreground text-background'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border bg-background">
            <Button className="w-full" size="lg" onClick={handleApply}>
              {hasActiveFilters && (
                <Badge className="ml-2 bg-background/20">
                  {[
                    localFilters.city,
                    localFilters.minRating > 0 && 'تقييم',
                    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 50000) && 'سعر',
                    localFilters.availableToday && 'متاح اليوم',
                  ].filter(Boolean).length}
                </Badge>
              )}
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { defaultFilters };