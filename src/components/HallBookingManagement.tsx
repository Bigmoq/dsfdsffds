import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar, Users, Check, X, Clock, 
  ChevronDown, Building2, Phone, Mail, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["hall_bookings"]["Row"] & {
  halls: Database["public"]["Tables"]["halls"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export function HallBookingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    // First get halls owned by this user
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

    // Then get bookings for those halls
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
      toast({
        title: status === "accepted" ? "تم قبول الحجز" : "تم رفض الحجز",
        description: status === "accepted" 
          ? "سيتم إشعار العميل بالموافقة"
          : "سيتم إشعار العميل بالرفض",
      });
      fetchBookings();
    }

    setUpdatingId(null);
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

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {pendingCount > 0 && (
          <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium">
            {pendingCount} طلب جديد
          </div>
        )}
        <h2 className="font-display text-xl font-bold text-foreground">
          طلبات الحجز
        </h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "الكل" },
          { value: "pending", label: "قيد المراجعة" },
          { value: "accepted", label: "مقبول" },
          { value: "rejected", label: "مرفوض" },
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
              {/* Main Info - Always Visible */}
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

                {/* Quick Stats */}
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
                      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-foreground text-right">معلومات العميل</h4>
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                          <span>{booking.profiles?.full_name || "غير محدد"}</span>
                          <Users className="w-4 h-4" />
                        </div>
                        {booking.profiles?.phone && (
                          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                            <span dir="ltr">{booking.profiles.phone}</span>
                            <Phone className="w-4 h-4" />
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

                      {/* Action Buttons - Only for pending */}
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
            لا توجد طلبات حجز
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">
            {filter === "all" 
              ? "ستظهر طلبات الحجز هنا عند استلامها"
              : "لا توجد طلبات بهذه الحالة"
            }
          </p>
        </div>
      )}
    </div>
  );
}
