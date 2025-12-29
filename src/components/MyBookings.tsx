import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar, Users, MapPin, Clock, ChevronDown, 
  CheckCircle, XCircle, Loader2, Building2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["hall_bookings"]["Row"] & {
  halls: Database["public"]["Tables"]["halls"]["Row"] | null;
};

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("hall_bookings")
      .select(`
        *,
        halls (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: BookingStatus | null) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="w-3 h-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 ml-1" />
            مؤكد
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="w-3 h-3 ml-1" />
            مرفوض
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">
            ملغي
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = (status: BookingStatus | null) => {
    switch (status) {
      case "pending":
        return "طلبك قيد المراجعة من قبل إدارة القاعة";
      case "accepted":
        return "تم تأكيد حجزك! يمكنك التواصل مع القاعة للتفاصيل";
      case "rejected":
        return "عذراً، تم رفض طلب الحجز من قبل القاعة";
      case "cancelled":
        return "تم إلغاء هذا الحجز";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          لا توجد حجوزات
        </h3>
        <p className="text-muted-foreground font-arabic text-sm">
          ستظهر حجوزاتك هنا بعد حجز قاعة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, index) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 10 }}
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
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    expandedId === booking.id ? "rotate-180" : ""
                  }`} 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <h3 className="font-display font-bold text-foreground">
                    {booking.halls?.name_ar || "قاعة غير معروفة"}
                  </h3>
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                  <span>{booking.halls?.city}</span>
                  <MapPin className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Date & Price */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <span className="font-bold text-primary">
                SAR {booking.total_price?.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{format(new Date(booking.booking_date), "d MMMM yyyy", { locale: ar })}</span>
                <Calendar className="w-4 h-4" />
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
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px bg-border" />

                  {/* Guest Counts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{booking.guest_count_men || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">قسم الرجال</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{booking.guest_count_women || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">قسم النساء</p>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className={`rounded-xl p-3 text-center text-sm ${
                    booking.status === "accepted" ? "bg-green-500/10 text-green-700" :
                    booking.status === "rejected" ? "bg-red-500/10 text-red-700" :
                    booking.status === "pending" ? "bg-amber-500/10 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {getStatusMessage(booking.status)}
                  </div>

                  {/* Booking Time */}
                  <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    <span>
                      تم الطلب: {format(new Date(booking.created_at || ""), "d MMM yyyy", { locale: ar })}
                    </span>
                    <Clock className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
