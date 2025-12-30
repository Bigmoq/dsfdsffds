import { useState, useEffect } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, isBefore, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, X, Check, Ban, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];
type AvailabilityStatus = Database["public"]["Enums"]["availability_status"];
type HallAvailability = Database["public"]["Tables"]["hall_availability"]["Row"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Booking {
  id: string;
  booking_date: string;
  status: BookingStatus;
  total_price: number | null;
  guest_count_men: number | null;
  guest_count_women: number | null;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

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

const bookingStatusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  cancelled: "bg-gray-500",
};

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "قيد المراجعة",
  accepted: "مؤكد",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

export function HallCalendarSheet({ open, onOpenChange, hall }: HallCalendarSheetProps) {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<HallAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>("booked");
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 12);

  useEffect(() => {
    if (open && hall) {
      fetchData();
    }
  }, [open, hall, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAvailability(), fetchBookings()]);
    setLoading(false);
  };

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

  const fetchBookings = async () => {
    const startDate = format(monthStart, "yyyy-MM-dd");
    const endDate = format(monthEnd, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("hall_bookings")
      .select("*")
      .eq("hall_id", hall.id)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .order("booking_date", { ascending: true });
    
    if (!error && data) {
      // Fetch profiles for each booking
      const bookingsWithProfiles = await Promise.all(
        data.map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", booking.user_id)
            .maybeSingle();
          return { ...booking, profiles: profile };
        })
      );
      setBookings(bookingsWithProfiles);
    }
  };

  const getDateStatus = (date: Date): AvailabilityStatus | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const record = availability.find(a => a.date === dateStr);
    return record?.status ?? null;
  };

  const getDateBooking = (date: Date): Booking | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.find(b => b.booking_date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const booking = getDateBooking(date);
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingDetails(true);
      setSelectedDate(null);
    } else if (!isBefore(date, today)) {
      setSelectedDate(date);
      setShowBookingDetails(false);
      setSelectedBooking(null);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    try {
      const existingRecord = availability.find(a => a.date === dateStr);
      
      if (existingRecord) {
        if (selectedStatus === "available") {
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
      
      fetchData();
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

  const handleUpdateBookingStatus = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    
    setUpdatingBooking(true);
    try {
      const { error } = await supabase
        .from("hall_bookings")
        .update({ status: newStatus })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // If accepted, also update availability
      if (newStatus === "accepted") {
        const existingAvailability = availability.find(
          a => a.date === selectedBooking.booking_date
        );
        
        if (existingAvailability) {
          await supabase
            .from("hall_availability")
            .update({ status: "booked" as AvailabilityStatus })
            .eq("id", existingAvailability.id);
        } else {
          await supabase
            .from("hall_availability")
            .insert({
              hall_id: hall.id,
              date: selectedBooking.booking_date,
              status: "booked" as AvailabilityStatus,
            });
        }
      }

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الحجز إلى ${bookingStatusLabels[newStatus]}`,
      });

      setShowBookingDetails(false);
      setSelectedBooking(null);
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الحجز",
        variant: "destructive",
      });
    } finally {
      setUpdatingBooking(false);
    }
  };

  const canGoBack = !isBefore(addMonths(currentMonth, -1), startOfMonth(today));
  const canGoForward = isBefore(currentMonth, addMonths(today, 11));

  // Count bookings by status for this month
  const monthStats = {
    pending: bookings.filter(b => b.status === "pending").length,
    accepted: bookings.filter(b => b.status === "accepted").length,
    total: bookings.length,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right mb-4">
          <SheetTitle className="font-display text-2xl flex items-center gap-2 justify-end">
            {hall.name_ar}
            <Calendar className="w-6 h-6 text-primary" />
          </SheetTitle>
        </SheetHeader>
        
        {/* Month Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{monthStats.total}</p>
            <p className="text-xs text-muted-foreground font-arabic">إجمالي الحجوزات</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{monthStats.pending}</p>
            <p className="text-xs text-muted-foreground font-arabic">قيد المراجعة</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{monthStats.accepted}</p>
            <p className="text-xs text-muted-foreground font-arabic">مؤكد</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          {(["available", "booked", "resale"] as AvailabilityStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="font-arabic text-xs text-muted-foreground">
                {statusLabels[status]}
              </span>
              <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="font-arabic text-xs text-muted-foreground">حجز قيد المراجعة</span>
            <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-500/30" />
          </div>
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
            const booking = getDateBooking(date);
            const isPast = isBefore(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const hasBooking = !!booking;
            const isPendingBooking = booking?.status === "pending";
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={isPast && !hasBooking}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative
                  ${isPast && !hasBooking ? "opacity-30 cursor-not-allowed" : "hover:ring-2 hover:ring-primary cursor-pointer"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${isToday ? "font-bold" : ""}
                  ${hasBooking 
                    ? `${bookingStatusColors[booking.status]} text-white` 
                    : status 
                      ? `${statusColors[status]} text-white` 
                      : "bg-muted text-foreground"
                  }
                  ${isWeekend(date) && !status && !hasBooking ? "bg-muted/50" : ""}
                `}
              >
                {format(date, "d")}
                {isPendingBooking && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Status Selection for empty dates */}
        <AnimatePresence>
          {selectedDate && !showBookingDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border pt-4 space-y-4"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Details Panel */}
        <AnimatePresence>
          {showBookingDetails && selectedBooking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border pt-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <h4 className="font-display text-lg font-bold">تفاصيل الحجز</h4>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${bookingStatusColors[selectedBooking.status]} text-white`}>
                    {bookingStatusLabels[selectedBooking.status]}
                  </Badge>
                  <p className="font-arabic text-sm text-muted-foreground">
                    {format(new Date(selectedBooking.booking_date), "EEEE d MMMM yyyy", { locale: ar })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{selectedBooking.guest_count_men || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-arabic">رجال</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{selectedBooking.guest_count_women || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-arabic">نساء</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">
                    {(selectedBooking.total_price || 0).toLocaleString()} ر.س
                  </span>
                  <span className="text-sm text-muted-foreground font-arabic">المبلغ</span>
                </div>

                {selectedBooking.profiles?.full_name && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {selectedBooking.profiles.full_name}
                    </span>
                    <span className="text-sm text-muted-foreground font-arabic">العميل</span>
                  </div>
                )}

                {selectedBooking.profiles?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground" dir="ltr">
                      {selectedBooking.profiles.phone}
                    </span>
                    <span className="text-sm text-muted-foreground font-arabic">الهاتف</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {format(new Date(selectedBooking.created_at), "d MMM yyyy - HH:mm", { locale: ar })}
                  </span>
                  <span className="font-arabic flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    تاريخ الطلب
                  </span>
                </div>
              </div>

              {/* Action Buttons for pending bookings */}
              {selectedBooking.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUpdateBookingStatus("accepted")}
                    disabled={updatingBooking}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updatingBooking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span className="font-arabic">قبول</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUpdateBookingStatus("rejected")}
                    disabled={updatingBooking}
                    variant="destructive"
                    className="flex-1"
                  >
                    {updatingBooking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-4 h-4 ml-2" />
                        <span className="font-arabic">رفض</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Bookings List */}
        {bookings.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="font-display text-lg font-bold mb-3 text-right">حجوزات هذا الشهر</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowBookingDetails(true);
                    setSelectedDate(null);
                  }}
                  className="w-full bg-muted/50 hover:bg-muted rounded-xl p-3 flex items-center justify-between transition-colors"
                >
                  <Badge className={`${bookingStatusColors[booking.status]} text-white text-xs`}>
                    {bookingStatusLabels[booking.status]}
                  </Badge>
                  <div className="text-right">
                    <p className="font-arabic text-sm text-foreground">
                      {format(new Date(booking.booking_date), "d MMMM", { locale: ar })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(booking.total_price || 0).toLocaleString()} ر.س
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
