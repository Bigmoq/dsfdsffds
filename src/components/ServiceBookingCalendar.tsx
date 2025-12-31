import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, User, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ServiceBooking {
  id: string;
  provider_id: string;
  package_id: string | null;
  user_id: string;
  booking_date: string;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  service_packages: {
    name_ar: string;
  } | null;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

export function ServiceBookingCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch user's service providers
  const { data: providers } = useQuery({
    queryKey: ['my-service-providers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, name_ar')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch bookings for the current month
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['service-bookings-calendar', providers?.map(p => p.id), format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!providers?.length) return [];
      
      const providerIds = providers.map(p => p.id);
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service_packages (name_ar)
        `)
        .in('provider_id', providerIds)
        .gte('booking_date', monthStart)
        .lte('booking_date', monthEnd)
        .neq('status', 'cancelled');
      
      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set((data || []).map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);
      
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(booking => ({
        ...booking,
        profiles: profilesMap.get(booking.user_id) || null,
      })) as ServiceBooking[];
    },
    enabled: !!providers?.length,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.booking_date), date)
    );
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  const handleDateClick = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    if (dateBookings.length > 0) {
      setSelectedDate(date);
      setSheetOpen(true);
    }
  };

  // Calculate first day offset (Saturday = 0 in Arabic calendar)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const firstDayOffset = (firstDayOfMonth.getDay() + 1) % 7; // Adjust for Saturday start

  const weekDays = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        
        <h2 className="font-display text-lg font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy', { locale: ar })}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>قيد الانتظار</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>مؤكد</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>مكتمل</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {days.map((day, index) => {
              const dateBookings = getBookingsForDate(day);
              const hasBookings = dateBookings.length > 0;
              const pendingCount = dateBookings.filter(b => b.status === 'pending').length;
              const confirmedCount = dateBookings.filter(b => b.status === 'confirmed').length;
              
              return (
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasBookings}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                    isToday(day) && "ring-2 ring-primary",
                    hasBookings && "cursor-pointer hover:bg-muted",
                    !hasBookings && "cursor-default"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary font-bold",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Booking Indicators */}
                  {hasBookings && (
                    <div className="flex gap-0.5 mt-1">
                      {pendingCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {confirmedCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                  )}
                  
                  {/* Booking Count Badge */}
                  {hasBookings && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                      {dateBookings.length}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-foreground">
            {bookings.length}
          </div>
          <div className="text-xs text-muted-foreground">إجمالي الحجوزات</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-xs text-muted-foreground">قيد الانتظار</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-xs text-muted-foreground">مؤكد</div>
        </Card>
      </div>

      {/* Date Bookings Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <SheetHeader className="text-right">
            <SheetTitle className="flex items-center justify-end gap-2">
              <span>
                حجوزات {selectedDate && format(selectedDate, 'EEEE، d MMMM yyyy', { locale: ar })}
              </span>
              <CalendarDays className="w-5 h-5 text-primary" />
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(60vh-100px)]">
            {selectedDateBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <Badge className={cn(
                        "text-white",
                        booking.status === 'pending' && "bg-amber-500",
                        booking.status === 'confirmed' && "bg-green-500",
                        booking.status === 'completed' && "bg-blue-500"
                      )}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="font-bold text-foreground">
                            {booking.profiles?.full_name || 'عميل'}
                          </span>
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {booking.service_packages && (
                          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <span>{booking.service_packages.name_ar}</span>
                            <Package className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      {booking.profiles?.phone && (
                        <span className="text-sm text-muted-foreground" dir="ltr">
                          {booking.profiles.phone}
                        </span>
                      )}
                      <span className="font-bold text-primary">
                        {booking.total_price.toLocaleString()} ر.س
                      </span>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-lg text-right">
                        {booking.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
