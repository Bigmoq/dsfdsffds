import { useState, useEffect } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, isBefore, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];
type AvailabilityStatus = Database["public"]["Enums"]["availability_status"];
type HallAvailability = Database["public"]["Tables"]["hall_availability"]["Row"];

interface HallCalendarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hall: Hall;
}

const statusColors: Record<AvailabilityStatus, string> = {
  available: "bg-available",
  booked: "bg-booked",
  resale: "bg-resale",
};

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "متاح",
  booked: "محجوز",
  resale: "إعادة بيع",
};

export function HallCalendarSheet({ open, onOpenChange, hall }: HallCalendarSheetProps) {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<HallAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>("booked");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 12);

  useEffect(() => {
    if (open && hall) {
      fetchAvailability();
    }
  }, [open, hall, currentMonth]);

  const fetchAvailability = async () => {
    const startDate = format(monthStart, "yyyy-MM-dd");
    const endDate = format(monthEnd, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("hall_availability")
      .select("*")
      .eq("hall_id", hall.id)
      .gte("date", startDate)
      .lte("date", endDate);
    
    if (!error && data) {
      setAvailability(data);
    }
  };

  const getDateStatus = (date: Date): AvailabilityStatus | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const record = availability.find(a => a.date === dateStr);
    return record?.status ?? null;
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    setSelectedDate(date);
  };

  const handleSaveStatus = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    try {
      // Check if record exists
      const existingRecord = availability.find(a => a.date === dateStr);
      
      if (existingRecord) {
        if (selectedStatus === "available") {
          // Delete to make it available (default)
          await supabase
            .from("hall_availability")
            .delete()
            .eq("id", existingRecord.id);
        } else {
          await supabase
            .from("hall_availability")
            .update({ status: selectedStatus })
            .eq("id", existingRecord.id);
        }
      } else if (selectedStatus !== "available") {
        await supabase
          .from("hall_availability")
          .insert({
            hall_id: hall.id,
            date: dateStr,
            status: selectedStatus,
          });
      }
      
      toast({
        title: "تم الحفظ",
        description: `تم تحديث حالة ${format(selectedDate, "d MMMM yyyy", { locale: ar })}`,
      });
      
      fetchAvailability();
      setSelectedDate(null);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canGoBack = !isBefore(addMonths(currentMonth, -1), startOfMonth(today));
  const canGoForward = isBefore(currentMonth, addMonths(today, 11));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl" dir="rtl">
        <SheetHeader className="text-right mb-4">
          <SheetTitle className="font-display text-2xl">
            تقويم القاعة - {hall.name_ar}
          </SheetTitle>
        </SheetHeader>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {(["available", "booked", "resale"] as AvailabilityStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className="font-arabic text-sm text-muted-foreground">
                {statusLabels[status]}
              </span>
              <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
            </div>
          ))}
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            disabled={!canGoBack}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <h3 className="font-display text-lg font-bold">
            {format(currentMonth, "MMMM yyyy", { locale: ar })}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={!canGoForward}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"].map((day) => (
            <div key={day} className="text-center text-xs font-arabic text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Empty cells for offset */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map((date) => {
            const status = getDateStatus(date);
            const isPast = isBefore(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${isPast ? "opacity-30 cursor-not-allowed" : "hover:ring-2 hover:ring-primary"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${isToday ? "font-bold" : ""}
                  ${status ? statusColors[status] + " text-white" : "bg-muted text-foreground"}
                  ${isWeekend(date) && !status ? "bg-muted/50" : ""}
                `}
              >
                {format(date, "d")}
              </button>
            );
          })}
        </div>
        
        {/* Status Selection */}
        {selectedDate && (
          <div className="border-t border-border pt-4 space-y-4">
            <p className="font-arabic text-center text-muted-foreground">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: ar })}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              {(["available", "booked", "resale"] as AvailabilityStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`
                    px-4 py-2 rounded-lg font-arabic text-sm transition-all
                    ${selectedStatus === status
                      ? statusColors[status] + " text-white shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
            
            <Button
              onClick={handleSaveStatus}
              disabled={loading}
              className="w-full gold-gradient text-white"
            >
              <span className="font-arabic">
                {loading ? "جارٍ الحفظ..." : "حفظ"}
              </span>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
