import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  addMonths, subMonths, isToday, isBefore, startOfDay 
} from "date-fns";
import { ar } from "date-fns/locale";
import { 
  ChevronLeft, ChevronRight, CalendarDays, User, Users, Package, 
  Loader2, Phone, MessageCircle, Clock, CreditCard, Check, X, 
  Ban, Tag, RotateCcw, CheckCircle2, Edit, DollarSign, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BookingCalendarViewProps {
  type: "hall" | "service";
}

interface HallBooking {
  id: string;
  hall_id: string;
  user_id: string;
  booking_date: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  total_price: number | null;
  guest_count_men: number | null;
  guest_count_women: number | null;
  notes: string | null;
  created_at: string;
  stripe_payment_id: string | null;
  halls: { name_ar: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}

interface ServiceBooking {
  id: string;
  provider_id: string;
  user_id: string;
  booking_date: string;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  package_id: string | null;
  service_packages: { name_ar: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}

type Booking = HallBooking | ServiceBooking;

export function BookingCalendarView({ type }: BookingCalendarViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resaleDialogOpen, setResaleDialogOpen] = useState(false);
  const [resaleDiscount, setResaleDiscount] = useState(10);
  const [depositPaid, setDepositPaid] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const today = startOfDay(new Date());

  // Fetch halls or service providers
  const { data: entities } = useQuery({
    queryKey: [type === "hall" ? "my-halls" : "my-service-providers", user?.id],
    queryFn: async () => {
      if (type === "hall") {
        const { data, error } = await supabase
          .from("halls")
          .select("id, name_ar")
          .eq("owner_id", user?.id);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("service_providers")
          .select("id, name_ar")
          .eq("owner_id", user?.id);
        if (error) throw error;
        return data;
      }
    },
    enabled: !!user?.id,
  });

  const entityIds = entities?.map((e) => e.id) || [];

  // Fetch bookings
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: [`${type}-bookings-calendar`, entityIds, format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      if (!entityIds.length) return [];

      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      if (type === "hall") {
        const { data, error } = await supabase
          .from("hall_bookings")
          .select(`
            *,
            halls (name_ar)
          `)
          .in("hall_id", entityIds)
          .gte("booking_date", monthStart)
          .lte("booking_date", monthEnd)
          .order("booking_date");

        if (error) throw error;

        const userIds = [...new Set((data || []).map((b) => b.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        return (data || []).map((booking) => ({
          ...booking,
          profiles: profilesMap.get(booking.user_id) || null,
        })) as HallBooking[];
      } else {
        const { data, error } = await supabase
          .from("service_bookings")
          .select(`
            *,
            service_packages (name_ar)
          `)
          .in("provider_id", entityIds)
          .gte("booking_date", monthStart)
          .lte("booking_date", monthEnd)
          .order("booking_date");

        if (error) throw error;

        const userIds = [...new Set((data || []).map((b) => b.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        return (data || []).map((booking) => ({
          ...booking,
          profiles: profilesMap.get(booking.user_id) || null,
        })) as ServiceBooking[];
      }
    },
    enabled: entityIds.length > 0,
  });

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: Record<string, unknown> }) => {
      const table = type === "hall" ? "hall_bookings" : "service_bookings";
      const { error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${type}-bookings-calendar`] });
      toast({ title: "تم التحديث", description: "تم تحديث الحجز بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث الحجز", variant: "destructive" });
    },
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((b) => isSameDay(new Date(b.booking_date), date));
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500";
      case "accepted":
      case "confirmed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "accepted":
      case "confirmed":
        return "مؤكد";
      case "rejected":
        return "مرفوض";
      case "cancelled":
        return "ملغي";
      case "completed":
        return "مكتمل";
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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    const hallBooking = booking as HallBooking;
    setDepositPaid(type === "hall" && hallBooking.stripe_payment_id !== null);
    setEditNotes(booking.notes || "");
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = (bookingId: string, status: string) => {
    updateMutation.mutate({ bookingId, updates: { status } });
    setEditDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveChanges = () => {
    if (!selectedBooking) return;
    updateMutation.mutate({
      bookingId: selectedBooking.id,
      updates: {
        notes: editNotes,
        stripe_payment_id: depositPaid ? "manual_deposit" : null,
      },
    });
    setEditDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleResale = async () => {
    if (!selectedBooking) return;
    
                  if (type === "hall") {
      const hallBooking = selectedBooking as HallBooking;
      await supabase.from("hall_availability").upsert({
        hall_id: hallBooking.hall_id,
        date: selectedBooking.booking_date,
        status: "resale" as const,
        notes: `إعادة بيع بخصم ${resaleDiscount}%`,
        resale_discount: resaleDiscount,
      }, { onConflict: "hall_id,date" });
    } else {
      const serviceBooking = selectedBooking as ServiceBooking;
      await supabase.from("service_provider_availability").upsert({
        provider_id: serviceBooking.provider_id,
        date: selectedBooking.booking_date,
        status: "available" as const,
        notes: `إعادة بيع بخصم ${resaleDiscount}%`,
      }, { onConflict: "provider_id,date" });
    }

    updateMutation.mutate({
      bookingId: selectedBooking.id,
      updates: { status: "cancelled" },
    });

    toast({
      title: "تم عرض الموعد للبيع",
      description: `سيظهر الموعد للعملاء بخصم ${resaleDiscount}%`,
    });

    setResaleDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedBooking(null);
    setResaleDiscount(10);
  };

  const handleWhatsApp = (phone: string | null, info: string) => {
    if (!phone) return;
    const message = encodeURIComponent(`مرحباً، بخصوص حجزك: ${info}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const handleCall = (phone: string | null) => {
    if (!phone) return;
    window.open(`tel:${phone}`, "_self");
  };

  const firstDayOffset = startOfMonth(currentMonth).getDay();
  const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  // Stats
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => 
    b.status === "accepted" || b.status === "confirmed"
  ).length;
  const paidCount = bookings.filter((b) => 
    (b as HallBooking).stripe_payment_id !== null
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3 text-center bg-muted/50">
          <div className="text-xl font-bold text-foreground">{bookings.length}</div>
          <div className="text-[10px] text-muted-foreground">الإجمالي</div>
        </Card>
        <Card className="p-3 text-center bg-amber-500/10">
          <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-[10px] text-muted-foreground">قيد المراجعة</div>
        </Card>
        <Card className="p-3 text-center bg-green-500/10">
          <div className="text-xl font-bold text-green-600">{acceptedCount}</div>
          <div className="text-[10px] text-muted-foreground">مؤكد</div>
        </Card>
        <Card className="p-3 text-center bg-primary/10">
          <div className="text-xl font-bold text-primary">{paidCount}</div>
          <div className="text-[10px] text-muted-foreground">دفع العربون</div>
        </Card>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <h2 className="font-display text-lg font-bold text-foreground">
          {format(currentMonth, "MMMM yyyy", { locale: ar })}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>قيد المراجعة</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>مؤكد</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span>مدفوع</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          <span>ملغي</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {days.map((day, index) => {
              const dateBookings = getBookingsForDate(day);
              const hasBookings = dateBookings.length > 0;
              const pendingExists = dateBookings.some((b) => b.status === "pending");
              const confirmedExists = dateBookings.some(
                (b) => b.status === "accepted" || b.status === "confirmed"
              );
              const paidExists = dateBookings.some(
                (b) => (b as HallBooking).stripe_payment_id !== null
              );
              const isPast = isBefore(day, today);

              return (
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasBookings}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                    isToday(day) && "ring-2 ring-primary",
                    hasBookings && "cursor-pointer hover:bg-muted/80",
                    !hasBookings && "cursor-default",
                    hasBookings && !isPast && "bg-muted/50",
                    isPast && "opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday(day) && "text-primary font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Status Indicators */}
                  {hasBookings && (
                    <div className="flex gap-0.5 mt-0.5">
                      {pendingExists && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {confirmedExists && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                      {paidExists && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  )}

                  {/* Count Badge */}
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

      {/* Date Bookings Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader className="text-right">
            <SheetTitle className="flex items-center justify-end gap-2">
              <span>
                حجوزات{" "}
                {selectedDate &&
                  format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })}
              </span>
              <CalendarDays className="w-5 h-5 text-primary" />
            </SheetTitle>
            <SheetDescription className="text-right">
              اضغط على أي حجز لعرض التفاصيل والتعديل
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(70vh-120px)]">
            {selectedDateBookings.map((booking, index) => {
              const hallBooking = booking as HallBooking;
              const isPaid = type === "hall" && hallBooking.stripe_payment_id !== null;
              
              return (
                <motion.button
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleBookingClick(booking)}
                  className="w-full text-right"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-white", getStatusColor(booking.status))}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                          {isPaid && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                              <CreditCard className="w-3 h-3 ml-1" />
                              مدفوع
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="font-bold text-foreground">
                              {booking.profiles?.full_name || "عميل"}
                            </span>
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          {type === "hall" && (
                            <p className="text-sm text-muted-foreground">
                              {(booking as HallBooking).halls?.name_ar}
                            </p>
                          )}
                          {type === "service" && (booking as ServiceBooking).service_packages && (
                            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                              <span>{(booking as ServiceBooking).service_packages?.name_ar}</span>
                              <Package className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(booking.created_at), "d MMM - HH:mm", { locale: ar })}
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          {(booking.total_price || 0).toLocaleString()} ر.س
                        </span>
                      </div>

                      {type === "hall" && (
                        <div className="flex items-center justify-end gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {((booking as HallBooking).guest_count_men || 0) +
                              ((booking as HallBooking).guest_count_women || 0)}{" "}
                            ضيف
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              تفاصيل وتعديل الحجز
            </DialogTitle>
            <DialogDescription>
              يمكنك تعديل حالة الحجز والملاحظات وحالة الدفع
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-white", getStatusColor(selectedBooking.status))}>
                    {getStatusLabel(selectedBooking.status)}
                  </Badge>
                  <span className="font-bold text-foreground">
                    {selectedBooking.profiles?.full_name || "عميل"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary">
                    {(selectedBooking.total_price || 0).toLocaleString()} ر.س
                  </span>
                  <span className="text-muted-foreground">
                    {format(new Date(selectedBooking.booking_date), "d MMMM yyyy", { locale: ar })}
                  </span>
                </div>

                {selectedBooking.profiles?.phone && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCall(selectedBooking.profiles?.phone || null)}
                    >
                      <Phone className="w-4 h-4 ml-1" />
                      اتصال
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                      onClick={() =>
                        handleWhatsApp(
                          selectedBooking.profiles?.phone || null,
                          format(new Date(selectedBooking.booking_date), "d/MM/yyyy")
                        )
                      }
                    >
                      <MessageCircle className="w-4 h-4 ml-1" />
                      واتساب
                    </Button>
                  </div>
                )}
              </div>

              {/* Deposit Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <Switch
                  checked={depositPaid}
                  onCheckedChange={setDepositPaid}
                />
                <div className="flex items-center gap-2">
                  <span className="font-medium">دفع العربون</span>
                  <DollarSign className={cn("w-5 h-5", depositPaid ? "text-green-500" : "text-muted-foreground")} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  className="text-right"
                />
              </div>

              {/* Status Actions */}
              {selectedBooking.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "rejected")}
                    disabled={updateMutation.isPending}
                  >
                    <X className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus(selectedBooking.id, type === "hall" ? "accepted" : "confirmed")}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-4 h-4 ml-1" />
                    قبول
                  </Button>
                </div>
              )}

              {(selectedBooking.status === "accepted" || selectedBooking.status === "confirmed") && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => setResaleDialogOpen(true)}
                    >
                      <Tag className="w-4 h-4 ml-1" />
                      إعادة بيع
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                      disabled={updateMutation.isPending}
                    >
                      <Ban className="w-4 h-4 ml-1" />
                      إلغاء
                    </Button>
                  </div>
                  {type === "service" && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      تحديد كمكتمل
                    </Button>
                  )}
                </div>
              )}

              {selectedBooking.status === "cancelled" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpdateStatus(selectedBooking.id, "pending")}
                  disabled={updateMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 ml-1" />
                  إعادة للمراجعة
                </Button>
              )}
            </div>
          )}

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={handleSaveChanges} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resale Dialog */}
      <Dialog open={resaleDialogOpen} onOpenChange={setResaleDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              إعادة بيع الموعد
            </DialogTitle>
            <DialogDescription>
              حدد نسبة الخصم للموعد ليظهر للعملاء
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نسبة الخصم (%)</Label>
              <Input
                type="number"
                min={5}
                max={50}
                value={resaleDiscount}
                onChange={(e) => setResaleDiscount(Number(e.target.value))}
                className="text-center text-lg font-bold"
              />
              <p className="text-xs text-muted-foreground text-center">
                الخصم من 5% إلى 50%
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>سيتم إلغاء الحجز الحالي وعرض الموعد للبيع بالخصم</span>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setResaleDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleResale}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "تأكيد إعادة البيع"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
