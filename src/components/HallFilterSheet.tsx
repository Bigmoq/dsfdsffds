import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDynamicCities } from "@/hooks/useDynamicCities";
import { MapPin, Users, Banknote, CalendarCheck, RotateCcw, Loader2 } from "lucide-react";

export interface HallFilters {
  city: string;
  minCapacity: number;
  maxCapacity: number;
  minPrice: number;
  maxPrice: number;
  availability: "all" | "available" | "resale";
}

interface HallFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: HallFilters;
  onApplyFilters: (filters: HallFilters) => void;
}

const defaultFilters: HallFilters = {
  city: "all",
  minCapacity: 0,
  maxCapacity: 2000,
  minPrice: 0,
  maxPrice: 100000,
  availability: "all",
};

export function HallFilterSheet({ open, onOpenChange, filters, onApplyFilters }: HallFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<HallFilters>(filters);
  const { data: dynamicCities = [], isLoading: citiesLoading } = useDynamicCities('public_halls');

  // Sync local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-right pb-4 border-b border-border">
          <SheetTitle className="font-display text-xl">فلترة القاعات</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* City Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <Label className="font-arabic text-base font-semibold">المدينة</Label>
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            {citiesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-end">
                {/* All cities option */}
                <button
                  onClick={() => setLocalFilters({ ...localFilters, city: "all" })}
                  className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                    localFilters.city === "all"
                      ? "gold-gradient text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  كل المدن
                </button>
                {dynamicCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setLocalFilters({ ...localFilters, city })}
                    className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                      localFilters.city === city
                        ? "gold-gradient text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {city}
                  </button>
                ))}
                {dynamicCities.length === 0 && (
                  <p className="text-sm text-muted-foreground font-arabic">لا توجد مدن متاحة حالياً</p>
                )}
              </div>
            )}
          </div>

          {/* Capacity Filter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <Label className="font-arabic text-base font-semibold">السعة (عدد الضيوف)</Label>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="px-2">
              <Slider
                value={[localFilters.minCapacity, localFilters.maxCapacity]}
                onValueChange={([min, max]) => setLocalFilters({ ...localFilters, minCapacity: min, maxCapacity: max })}
                max={2000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground font-arabic">
                <span>{localFilters.maxCapacity.toLocaleString()} ضيف</span>
                <span>{localFilters.minCapacity.toLocaleString()} ضيف</span>
              </div>
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <Label className="font-arabic text-base font-semibold">نطاق السعر</Label>
              <Banknote className="w-4 h-4 text-primary" />
            </div>
            <div className="px-2">
              <Slider
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onValueChange={([min, max]) => setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max })}
                max={100000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground font-arabic">
                <span>{localFilters.maxPrice.toLocaleString()} ريال</span>
                <span>{localFilters.minPrice.toLocaleString()} ريال</span>
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <Label className="font-arabic text-base font-semibold">التوفر</Label>
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {[
                { id: "all", label: "الكل" },
                { id: "available", label: "متاح" },
                { id: "resale", label: "إعادة بيع" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLocalFilters({ ...localFilters, availability: option.id as HallFilters["availability"] })}
                  className={`px-4 py-2 rounded-full text-sm font-arabic transition-all ${
                    localFilters.availability === option.id
                      ? "gold-gradient text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-arabic">إعادة تعيين</span>
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 gold-gradient text-white font-arabic"
          >
            تطبيق الفلاتر
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { defaultFilters };
