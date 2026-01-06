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
  Ban, Tag, RotateCcw, CheckCircle2, Edit, DollarSign, AlertCircle, Plus,
  Trash2, ExternalLink
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
  
  // External booking state
  const [addExternalOpen, setAddExternalOpen] = useState(false);
  const [editExternalMode, setEditExternalMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [externalBooking, setExternalBooking] = useState({
    customerName: "",
    phone: "",
    bookingDate: "",
    totalPrice: "",
    notes: "",
    depositPaid: false,
    guestCountMen: "",
    guestCountWomen: "",
  });

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

  // Add external booking
  const handleAddExternalBooking = async () => {
    if (!externalBooking.customerName || !externalBooking.bookingDate || !entities?.length) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const entityId = entities[0].id;

    try {
      if (type === "hall") {
        const { error } = await supabase.from("hall_bookings").insert({
          hall_id: entityId,
          user_id: user?.id!,
          booking_date: externalBooking.bookingDate,
          status: "accepted",
          total_price: parseInt(externalBooking.totalPrice) || 0,
          notes: `حجز خارجي - ${externalBooking.customerName}${externalBooking.phone ? ` - ${externalBooking.phone}` : ""}${externalBooking.notes ? `\n${externalBooking.notes}` : ""}`,
          guest_count_men: parseInt(externalBooking.guestCountMen) || 0,
          guest_count_women: parseInt(externalBooking.guestCountWomen) || 0,
          stripe_payment_id: externalBooking.depositPaid ? "external_deposit" : null,
        });
        if (error) throw error;

        // Update availability
        await supabase.from("hall_availability").upsert({
          hall_id: entityId,
          date: externalBooking.bookingDate,
          status: "booked" as const,
          notes: `حجز خارجي - ${externalBooking.customerName}`,
        }, { onConflict: "hall_id,date" });
      } else {
        const { error } = await supabase.from("service_bookings").insert({
          provider_id: entityId,
          user_id: user?.id!,
          booking_date: externalBooking.bookingDate,
          status: "confirmed",
          total_price: parseInt(externalBooking.totalPrice) || 0,
          notes: `حجز خارجي - ${externalBooking.customerName}${externalBooking.phone ? ` - ${externalBooking.phone}` : ""}${externalBooking.notes ? `\n${externalBooking.notes}` : ""}`,
        });
        if (error) throw error;

        // Update availability
        await supabase.from("service_provider_availability").upsert({
          provider_id: entityId,
          date: externalBooking.bookingDate,
          status: "booked" as const,
          notes: `حجز خارجي - ${externalBooking.customerName}`,
        }, { onConflict: "provider_id,date" });
      }

      toast({ title: "تم الإضافة", description: "تم إضافة الحجز الخارجي بنجاح" });
      setAddExternalOpen(false);
      setExternalBooking({
        customerName: "",
        phone: "",
        bookingDate: "",
        totalPrice: "",
        notes: "",
        depositPaid: false,
        guestCountMen: "",
        guestCountWomen: "",
      });
      refetch();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل إضافة الحجز", variant: "destructive" });
    }
  };

  // Check if booking is external (user_id matches owner)
  const isExternalBooking = (booking: Booking): boolean => {
    return booking.notes?.includes("حجز خارجي -") || false;
  };

  // Parse external booking data from notes
  const parseExternalBookingData = (booking: Booking) => {
    const notes = booking.notes || "";
    const lines = notes.split("\n");
    const firstLine = lines[0] || "";
    
    // Extract customer name and phone from "حجز خارجي - الاسم - الرقم"
    const match = firstLine.match(/حجز خارجي - ([^-]+)(?:\s*-\s*(.+))?/);
    const customerName = match?.[1]?.trim() || "";
    const phone = match?.[2]?.trim() || "";
    const remainingNotes = lines.slice(1).join("\n").trim();
    
    return { customerName, phone, remainingNotes };
  };

  // Open edit dialog for external booking
  const handleEditExternalBooking = (booking: Booking) => {
    const { customerName, phone, remainingNotes } = parseExternalBookingData(booking);
    const hallBooking = booking as HallBooking;
    
    setExternalBooking({
      customerName,
      phone,
      bookingDate: booking.booking_date,
      totalPrice: String(booking.total_price || ""),
      notes: remainingNotes,
      depositPaid: type === "hall" && hallBooking.stripe_payment_id !== null,
      guestCountMen: String(hallBooking.guest_count_men || ""),
      guestCountWomen: String(hallBooking.guest_count_women || ""),
    });
    setEditExternalMode(true);
    setAddExternalOpen(true);
    setEditDialogOpen(false);
  };

  // Update external booking
  const handleUpdateExternalBooking = async () => {
    if (!selectedBooking || !externalBooking.customerName || !externalBooking.bookingDate) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    try {
      const table = type === "hall" ? "hall_bookings" : "service_bookings";
      const notesText = `حجز خارجي - ${externalBooking.customerName}${externalBooking.phone ? ` - ${externalBooking.phone}` : ""}${externalBooking.notes ? `\n${externalBooking.notes}` : ""}`;

      const updates: Record<string, unknown> = {
        booking_date: externalBooking.bookingDate,
        total_price: parseInt(externalBooking.totalPrice) || 0,
        notes: notesText,
        updated_at: new Date().toISOString(),
      };

      if (type === "hall") {
        updates.guest_count_men = parseInt(externalBooking.guestCountMen) || 0;
        updates.guest_count_women = parseInt(externalBooking.guestCountWomen) || 0;
        updates.stripe_payment_id = externalBooking.depositPaid ? "external_deposit" : null;
      }

      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast({ title: "تم التحديث", description: "تم تحديث الحجز الخارجي بنجاح" });
      resetExternalForm();
      refetch();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تحديث الحجز", variant: "destructive" });
    }
  };

  // Delete external booking
  const handleDeleteExternalBooking = async () => {
    if (!selectedBooking) return;

    try {
      const table = type === "hall" ? "hall_bookings" : "service_bookings";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // Also delete availability
      if (type === "hall") {
        const hallBooking = selectedBooking as HallBooking;
        await supabase
          .from("hall_availability")
          .delete()
          .eq("hall_id", hallBooking.hall_id)
          .eq("date", selectedBooking.booking_date);
      } else {
        const serviceBooking = selectedBooking as ServiceBooking;
        await supabase
          .from("service_provider_availability")
          .delete()
          .eq("provider_id", serviceBooking.provider_id)
          .eq("date", selectedBooking.booking_date);
      }

      toast({ title: "تم الحذف", description: "تم حذف الحجز بنجاح" });
      setDeleteConfirmOpen(false);
      setEditDialogOpen(false);
      setSelectedBooking(null);
      refetch();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف الحجز", variant: "destructive" });
    }
  };

  // Reset external form
  const resetExternalForm = () => {
    setAddExternalOpen(false);
    setEditExternalMode(false);
    setSelectedBooking(null);
    setExternalBooking({
      customerName: "",
      phone: "",
      bookingDate: "",
      totalPrice: "",
      notes: "",
      depositPaid: false,
      guestCountMen: "",
      guestCountWomen: "",
    });
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setAddExternalOpen(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            حجز خارجي
          </Button>
        </div>

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
        <CardContent className="p-2">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[70px]" />
            ))}

            {days.map((day, index) => {
              const dateBookings = getBookingsForDate(day);
              const hasBookings = dateBookings.length > 0;
              const firstBooking = dateBookings[0];
              const isPast = isBefore(day, today);
              
              // Get first booking details
              const customerName = firstBooking?.profiles?.full_name;
              const notes = firstBooking?.notes;
              const isPaid = type === "hall" && firstBooking && (firstBooking as HallBooking).stripe_payment_id !== null;
              const status = firstBooking?.status;

              return (
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.003 }}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasBookings}
                  className={cn(
                    "min-h-[70px] rounded-lg flex flex-col items-stretch p-1 relative transition-all text-right",
                    isToday(day) && "ring-2 ring-primary",
                    hasBookings && "cursor-pointer hover:shadow-md",
                    !hasBookings && "cursor-default bg-muted/30",
                    hasBookings && !isPast && "bg-muted/50",
                    isPast && "opacity-50"
                  )}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full",
                        isToday(day) && "bg-primary text-primary-foreground font-bold",
                        !isToday(day) && "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {/* Count Badge */}
                    {dateBookings.length > 1 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{dateBookings.length - 1}
                      </span>
                    )}
                  </div>

                  {/* Booking Info */}
                  {hasBookings && (
                    <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
                      {/* Customer Name */}
                      {customerName && (
                        <p className="text-[8px] font-medium text-foreground truncate">
                          {customerName.split(" ")[0]}
                        </p>
                      )}
                      
                      {/* Status & Payment Indicators */}
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {/* Status Dot */}
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          status === "pending" && "bg-amber-500",
                          (status === "accepted" || status === "confirmed") && "bg-green-500",
                          status === "cancelled" && "bg-gray-400",
                          status === "rejected" && "bg-red-500"
                        )} />
                        
                        {/* Payment Status */}
                        {type === "hall" && (
                          <span className={cn(
                            "text-[7px] px-1 rounded",
                            isPaid ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-600"
                          )}>
                            {isPaid ? "مدفوع" : "غير مدفوع"}
                          </span>
                        )}
                      </div>
                      
                      {/* Notes Preview */}
                      {notes && (
                        <p className="text-[7px] text-muted-foreground line-clamp-2 leading-tight">
                          {notes}
                        </p>
                      )}
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

              {/* External Booking Actions */}
              {isExternalBooking(selectedBooking) && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditExternalBooking(selectedBooking)}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل الحجز
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              )}

              {/* External Booking Indicator */}
              {isExternalBooking(selectedBooking) && (
                <div className="flex items-center justify-center gap-2 p-2 bg-blue-500/10 rounded-lg text-sm text-blue-600">
                  <ExternalLink className="w-4 h-4" />
                  <span>حجز خارجي</span>
                </div>
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

      {/* Add/Edit External Booking Dialog */}
      <Dialog open={addExternalOpen} onOpenChange={(open) => {
        if (!open) resetExternalForm();
        else setAddExternalOpen(open);
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editExternalMode ? (
                <>
                  <Edit className="w-5 h-5 text-primary" />
                  تعديل حجز خارجي
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-primary" />
                  إضافة حجز خارجي
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editExternalMode ? "قم بتعديل بيانات الحجز الخارجي" : "أضف حجز من خارج التطبيق للتقويم"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label>اسم العميل *</Label>
              <Input
                value={externalBooking.customerName}
                onChange={(e) => setExternalBooking(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="أدخل اسم العميل"
                className="text-right"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>رقم الجوال</Label>
              <Input
                value={externalBooking.phone}
                onChange={(e) => setExternalBooking(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                className="text-right"
                dir="ltr"
              />
            </div>

            {/* Booking Date */}
            <div className="space-y-2">
              <Label>تاريخ الحجز *</Label>
              <Input
                type="date"
                value={externalBooking.bookingDate}
                onChange={(e) => setExternalBooking(prev => ({ ...prev, bookingDate: e.target.value }))}
                className="text-right"
              />
            </div>

            {/* Total Price */}
            <div className="space-y-2">
              <Label>السعر الإجمالي</Label>
              <Input
                type="number"
                value={externalBooking.totalPrice}
                onChange={(e) => setExternalBooking(prev => ({ ...prev, totalPrice: e.target.value }))}
                placeholder="0"
                className="text-right"
              />
            </div>

            {/* Guest Count for Halls */}
            {type === "hall" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>عدد الرجال</Label>
                  <Input
                    type="number"
                    value={externalBooking.guestCountMen}
                    onChange={(e) => setExternalBooking(prev => ({ ...prev, guestCountMen: e.target.value }))}
                    placeholder="0"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>عدد النساء</Label>
                  <Input
                    type="number"
                    value={externalBooking.guestCountWomen}
                    onChange={(e) => setExternalBooking(prev => ({ ...prev, guestCountWomen: e.target.value }))}
                    placeholder="0"
                    className="text-right"
                  />
                </div>
              </div>
            )}

            {/* Deposit Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <Switch
                checked={externalBooking.depositPaid}
                onCheckedChange={(checked) => setExternalBooking(prev => ({ ...prev, depositPaid: checked }))}
              />
              <div className="flex items-center gap-2">
                <span className="font-medium">تم دفع العربون</span>
                <DollarSign className={cn("w-5 h-5", externalBooking.depositPaid ? "text-green-500" : "text-muted-foreground")} />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={externalBooking.notes}
                onChange={(e) => setExternalBooking(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أضف ملاحظات..."
                className="text-right"
              />
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={resetExternalForm}>
              إلغاء
            </Button>
            <Button onClick={editExternalMode ? handleUpdateExternalBooking : handleAddExternalBooking}>
              {editExternalMode ? (
                <>
                  <Check className="w-4 h-4 ml-1" />
                  حفظ التعديلات
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة الحجز
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteExternalBooking}
            >
              <Trash2 className="w-4 h-4 ml-1" />
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
