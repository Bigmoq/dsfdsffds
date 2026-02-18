import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar, Users, Check, X, Clock, ChevronDown, Building2, 
  MessageCircle, Loader2, RefreshCw, Ban, DollarSign, Tag, Percent,
  RotateCcw, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["hall_bookings"]["Row"] & {
  halls: Database["public"]["Tables"]["halls"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface HallBookingManagementProps {
  refreshKey?: number;
}

export function HallBookingManagement({ refreshKey }: HallBookingManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [resaleDialogOpen, setResaleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [resaleDiscount, setResaleDiscount] = useState<number>(10);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, refreshKey]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data: halls } = await supabase
      .from("halls")
      .select("id")
      .eq("owner_id", user.id);

    if (!halls || halls.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const hallIds = halls.map(h => h.id);

    const { data, error } = await supabase
      .from("hall_bookings")
      .select(`
        *,
        halls (*),
        profiles (*)
      `)
      .in("hall_id", hallIds)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setUpdatingId(bookingId);

    const { error } = await supabase
      .from("hall_bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الحجز",
        variant: "destructive",
      });
    } else {
      // Process refund if rejected or cancelled
      if (status === "rejected" || status === "cancelled") {
        try {
          await supabase.functions.invoke("process-refund", {
            body: { booking_id: bookingId, booking_type: "hall" },
          });
        } catch (refundErr) {
          console.error("Refund error (non-blocking):", refundErr);
        }
      }

      const messages: Record<BookingStatus, { title: string; description: string }> = {
        accepted: { title: "تم قبول الحجز", description: "سيتم إشعار العميل بالموافقة" },
        rejected: { title: "تم رفض الحجز", description: "سيتم إشعار العميل وإرجاع العربون" },
        cancelled: { title: "تم إلغاء الحجز", description: "تم إلغاء الحجز وإرجاع العربون" },
        pending: { title: "تم التحديث", description: "تم تحديث حالة الحجز" },
      };
      toast(messages[status]);
      fetchBookings();
    }

    setUpdatingId(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    await updateBookingStatus(selectedBooking.id, "cancelled");
    
    // Update hall availability to available
    if (selectedBooking.hall_id) {
      await supabase
        .from("hall_availability")
        .upsert({
          hall_id: selectedBooking.hall_id,
          date: selectedBooking.booking_date,
          status: "available",
          notes: "تم إلغاء الحجز السابق"
        }, { onConflict: 'hall_id,date' });
    }
    
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleResaleBooking = async () => {
    if (!selectedBooking) return;
    
    setUpdatingId(selectedBooking.id);
    
    // Update hall availability to resale with discount
    if (selectedBooking.hall_id) {
      const { error } = await supabase
        .from("hall_availability")
        .upsert({
          hall_id: selectedBooking.hall_id,
          date: selectedBooking.booking_date,
          status: "resale",
          resale_discount: resaleDiscount,
          notes: `إعادة بيع بخصم ${resaleDiscount}%`
        }, { onConflict: 'hall_id,date' });

      if (error) {
        toast({
          title: "خطأ",
          description: "فشل في عرض الحجز للبيع",
          variant: "destructive",
        });
      } else {
        // Cancel the current booking
        await supabase
          .from("hall_bookings")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", selectedBooking.id);
        
        toast({
          title: "تم عرض الموعد للبيع",
          description: `سيظهر الموعد للعملاء بخصم ${resaleDiscount}%`,
        });
        fetchBookings();
      }
    }
    
    setUpdatingId(null);
    setResaleDialogOpen(false);
    setSelectedBooking(null);
    setResaleDiscount(10);
  };

  const handleWhatsApp = (phone: string | null, bookingInfo: string) => {
    if (!phone) return;
    const message = encodeURIComponent(`مرحباً، بخصوص حجزك: ${bookingInfo}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };


  const getStatusBadge = (status: BookingStatus | null) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">قيد المراجعة</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">مقبول</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">مرفوض</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">ملغي</Badge>;
      default:
        return null;
    }
  };

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const acceptedCount = bookings.filter(b => b.status === "accepted").length;

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-500/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">قيد المراجعة</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
          <p className="text-xs text-muted-foreground">مقبول</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
          <p className="text-xs text-muted-foreground">الإجمالي</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={fetchBookings}>
          <RefreshCw className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl font-bold text-foreground">
          إدارة الحجوزات
        </h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "الكل" },
          { value: "pending", label: "قيد المراجعة" },
          { value: "accepted", label: "مقبول" },
          { value: "cancelled", label: "ملغي" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as BookingStatus | "all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab.value
                ? "gold-gradient text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-luxe rounded-xl overflow-hidden"
            >
              {/* Main Info */}
              <button
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                className="w-full p-4 text-right"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedId === booking.id ? "rotate-180" : ""
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {booking.halls?.name_ar || "قاعة غير معروفة"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-arabic">
                        {format(new Date(booking.booking_date), "d MMMM yyyy", { locale: ar })}
                      </span>
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="font-bold text-primary">
                    SAR {booking.total_price?.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(booking.guest_count_men || 0) + (booking.guest_count_women || 0)} ضيف
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === booking.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      <div className="h-px bg-border" />

                      {/* Guest Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{booking.guest_count_men || 0}</p>
                          <p className="text-xs text-muted-foreground">قسم الرجال</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{booking.guest_count_women || 0}</p>
                          <p className="text-xs text-muted-foreground">قسم النساء</p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-foreground text-right">معلومات العميل</h4>
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                          <span>{booking.profiles?.full_name || "غير محدد"}</span>
                          <Users className="w-4 h-4" />
                        </div>
                        
                        {/* Contact Button */}
                        {booking.profiles?.phone && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(
                                  booking.profiles?.phone || null,
                                  `${booking.halls?.name_ar} - ${format(new Date(booking.booking_date), 'dd/MM/yyyy')}`
                                );
                              }}
                            >
                              <MessageCircle className="w-4 h-4 ml-1" />
                              واتساب
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <h4 className="font-semibold text-foreground text-right mb-2">ملاحظات</h4>
                          <p className="text-sm text-muted-foreground text-right">{booking.notes}</p>
                        </div>
                      )}

                      {/* Booking Time */}
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <span>تم الطلب: {format(new Date(booking.created_at || ""), "d MMM yyyy - h:mm a", { locale: ar })}</span>
                        <Clock className="w-3 h-3" />
                      </div>

                      {/* Action Buttons - Based on status */}
                      {booking.status === "pending" && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            className="flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30"
                            variant="outline"
                            disabled={updatingId === booking.id}
                            onClick={() => updateBookingStatus(booking.id, "rejected")}
                          >
                            {updatingId === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 ml-2" />
                                رفض
                              </>
                            )}
                          </Button>
                          <Button
                            className="flex-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/30"
                            variant="outline"
                            disabled={updatingId === booking.id}
                            onClick={() => updateBookingStatus(booking.id, "accepted")}
                          >
                            {updatingId === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 ml-2" />
                                قبول
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Actions for accepted bookings */}
                      {booking.status === "accepted" && (
                        <div className="space-y-3 pt-2">
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setResaleDialogOpen(true);
                              }}
                            >
                              <Tag className="w-4 h-4 ml-2" />
                              إعادة بيع
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <Ban className="w-4 h-4 ml-2" />
                              إلغاء
                            </Button>
                          </div>
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "pending")}
                            disabled={updatingId === booking.id}
                          >
                            <RotateCcw className="w-4 h-4 ml-2" />
                            إعادة للمراجعة
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            لا توجد حجوزات
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">
            {filter === "all" 
              ? "ستظهر الحجوزات هنا عند استلامها"
              : "لا توجد حجوزات بهذه الحالة"
            }
          </p>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء الحجز</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إلغاء هذا الحجز؟ سيتم إشعار العميل بالإلغاء وسيصبح الموعد متاحاً للحجز مرة أخرى.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleCancelBooking}
            >
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resale Dialog */}
      <Dialog open={resaleDialogOpen} onOpenChange={setResaleDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              إعادة بيع الحجز
            </DialogTitle>
            <DialogDescription>
              سيتم إلغاء الحجز الحالي وعرض الموعد للعملاء بسعر مخفض
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">{selectedBooking?.halls?.name_ar}</span>
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{format(new Date(selectedBooking?.booking_date || new Date()), "d MMMM yyyy", { locale: ar })}</span>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">SAR {selectedBooking?.total_price?.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">السعر الأصلي</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount" className="text-right block">نسبة الخصم</Label>
              <div className="relative">
                <Input
                  id="discount"
                  type="number"
                  min={5}
                  max={50}
                  value={resaleDiscount}
                  onChange={(e) => setResaleDiscount(Number(e.target.value))}
                  className="pl-10 text-right"
                />
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                السعر بعد الخصم: SAR {((selectedBooking?.total_price || 0) * (1 - resaleDiscount / 100)).toLocaleString()}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setResaleDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleResaleBooking}
              disabled={updatingId === selectedBooking?.id}
              className="gold-gradient"
            >
              {updatingId === selectedBooking?.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  عرض للبيع
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}