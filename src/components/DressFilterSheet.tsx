import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { saudiCities } from "@/data/weddingData";
import { X } from "lucide-react";

export interface DressFilters {
  city: string;
  size: string;
  priceRange: [number, number];
}

interface DressFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: DressFilters;
  onApplyFilters: (filters: DressFilters) => void;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function DressFilterSheet({ open, onClose, filters, onApplyFilters }: DressFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<DressFilters>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleCitySelect = (city: string) => {
    setLocalFilters(prev => ({
      ...prev,
      city: prev.city === city ? "" : city
    }));
  };

  const handleSizeSelect = (size: string) => {
    setLocalFilters(prev => ({
      ...prev,
      size: prev.size === size ? "" : size
    }));
  };

  const handlePriceChange = (value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number]
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: DressFilters = {
      city: "",
      size: "",
      priceRange: [0, 10000]
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card">
        <SheetHeader className="text-right pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <SheetTitle className="font-display text-xl">تصفية النتائج</SheetTitle>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* City Filter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold font-arabic block text-right">المدينة</Label>
            <div className="flex flex-wrap gap-2 justify-end">
              {saudiCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                    localFilters.city === city
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold font-arabic block text-right">المقاس</Label>
            <div className="flex flex-wrap gap-2 justify-end">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                    localFilters.size === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-arabic">
                {localFilters.priceRange[0].toLocaleString()} - {localFilters.priceRange[1].toLocaleString()} ريال
              </span>
              <Label className="text-base font-semibold font-arabic">نطاق السعر</Label>
            </div>
            <Slider
              value={localFilters.priceRange}
              onValueChange={handlePriceChange}
              min={0}
              max={10000}
              step={100}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-arabic">
              <span>10,000 ريال</span>
              <span>0 ريال</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border/50 flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 py-6 rounded-xl font-arabic"
          >
            إعادة تعيين
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 py-6 rounded-xl bg-primary text-primary-foreground font-arabic"
          >
            تطبيق الفلاتر
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}