import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar, Users, MapPin, Clock, ChevronDown, 
  CheckCircle, XCircle, Loader2, Building2, Package, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { AddVendorReviewSheet } from "./AddVendorReviewSheet";
import { AddHallReviewSheet } from "./AddHallReviewSheet";

type HallBooking = Database["public"]["Tables"]["hall_bookings"]["Row"] & {
  halls: Database["public"]["Tables"]["halls"]["Row"] | null;
};

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface ServiceBooking {
  id: string;
  provider_id: string;
  package_id: string | null;
  booking_date: string;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  service_providers: {
    name_ar: string;
    city: string;
  } | null;
  service_packages: {
    name_ar: string;
  } | null;
}

export function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Review sheet states
  const [reviewServiceBooking, setReviewServiceBooking] = useState<ServiceBooking | null>(null);
  const [reviewHallBooking, setReviewHallBooking] = useState<HallBooking | null>(null);
  const [userServiceReviews, setUserServiceReviews] = useState<Record<string, any>>({});
  const [userHallReviews, setUserHallReviews] = useState<Record<string, any>>({});

  // Fetch hall bookings
  const { data: hallBookings = [], isLoading: hallLoading } = useQuery({
    queryKey: ['my-hall-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hall_bookings")
        .select(`*, halls (*)`)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HallBooking[];
    },
    enabled: !!user,
  });

  // Fetch service bookings
  const { data: serviceBookings = [], isLoading: serviceLoading } = useQuery({
    queryKey: ['my-service-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bookings")
        .select(`
          *,
          service_providers (name_ar, city),
          service_packages (name_ar)
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ServiceBooking[];
    },
    enabled: !!user,
  });

  // Fetch user's service reviews
  const { data: serviceReviews = [] } = useQuery({
    queryKey: ['user-service-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_provider_reviews")
        .select("id, provider_id, rating, comment")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's hall reviews
  const { data: hallReviews = [] } = useQuery({
    queryKey: ['user-hall-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hall_reviews")
        .select("id, hall_id, rating, comment")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Cancel service booking mutation
  const cancelServiceBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("service_bookings")
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq("id", bookingId)
        .eq("user_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-service-bookings'] });
      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء الحجز بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive",
      });
    },
  });

  const getHallStatusBadge = (status: BookingStatus | null) => {
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

  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="w-3 h-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 ml-1" />
            مؤكد
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <CheckCircle className="w-3 h-3 ml-1" />
            مكتمل
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">
            ملغي
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const getServiceStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "طلبك قيد المراجعة من قبل مقدم الخدمة";
      case "confirmed":
        return "تم تأكيد حجزك! يمكنك التواصل مع مقدم الخدمة للتفاصيل";
      case "completed":
        return "تم إكمال هذه الخدمة بنجاح";
      case "cancelled":
        return "تم إلغاء هذا الحجز";
      default:
        return "";
    }
  };

  const loading = hallLoading || serviceLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const hasHallBookings = hallBookings.length > 0;
  const hasServiceBookings = serviceBookings.length > 0;
  const hasNoBookings = !hasHallBookings && !hasServiceBookings;

  if (hasNoBookings) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          لا توجد حجوزات
        </h3>
        <p className="text-muted-foreground font-arabic text-sm">
          ستظهر حجوزاتك هنا بعد إجراء حجز
        </p>
      </div>
    );
  }

  return (
    <>
    <Tabs defaultValue={hasServiceBookings ? "services" : "halls"} className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="services" className="relative">
          <Package className="w-4 h-4 ml-1" />
          الخدمات
          {serviceBookings.length > 0 && (
            <span className="mr-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
              {serviceBookings.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="halls" className="relative">
          <Building2 className="w-4 h-4 ml-1" />
          القاعات
          {hallBookings.length > 0 && (
            <span className="mr-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
              {hallBookings.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Service Bookings Tab */}
      <TabsContent value="services" className="space-y-3">
        {serviceBookings.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">لا توجد حجوزات خدمات</p>
          </div>
        ) : (
          serviceBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-luxe rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                className="w-full p-4 text-right"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getServiceStatusBadge(booking.status)}
                    <ChevronDown 
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        expandedId === booking.id ? "rotate-180" : ""
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <h3 className="font-display font-bold text-foreground">
                        {booking.service_providers?.name_ar || "مقدم خدمة"}
                      </h3>
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                      <span>{booking.service_providers?.city}</span>
                      <MapPin className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="font-bold text-primary">
                    {booking.total_price?.toLocaleString()} ر.س
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{format(new Date(booking.booking_date), "d MMMM yyyy", { locale: ar })}</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </button>

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

                      {/* Package Info */}
                      {booking.service_packages && (
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-sm font-medium">{booking.service_packages.name_ar}</p>
                          <p className="text-xs text-muted-foreground">الباقة المختارة</p>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div className="bg-muted/50 rounded-xl p-3 text-right">
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}

                      {/* Status Message */}
                      <div className={`rounded-xl p-3 text-center text-sm ${
                        booking.status === "confirmed" ? "bg-green-500/10 text-green-700" :
                        booking.status === "cancelled" ? "bg-gray-500/10 text-gray-700" :
                        booking.status === "completed" ? "bg-blue-500/10 text-blue-700" :
                        booking.status === "pending" ? "bg-amber-500/10 text-amber-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {getServiceStatusMessage(booking.status)}
                      </div>

                      {/* Rate Button for completed bookings */}
                      {booking.status === "completed" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setReviewServiceBooking(booking)}
                        >
                          <Star className="w-4 h-4 ml-2" />
                          {serviceReviews.find(r => r.provider_id === booking.provider_id)
                            ? "تعديل التقييم"
                            : "قيّم الخدمة"}
                        </Button>
                      )}

                      {/* Cancel Button */}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              إلغاء الحجز
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-right">تأكيد الإلغاء</AlertDialogTitle>
                              <AlertDialogDescription className="text-right">
                                هل أنت متأكد من إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row-reverse gap-2">
                              <AlertDialogCancel>تراجع</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelServiceBooking.mutate(booking.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {cancelServiceBooking.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "تأكيد الإلغاء"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Booking Time */}
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <span>
                          تم الطلب: {format(new Date(booking.created_at), "d MMM yyyy", { locale: ar })}
                        </span>
                        <Clock className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </TabsContent>

      {/* Hall Bookings Tab */}
      <TabsContent value="halls" className="space-y-3">
        {hallBookings.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">لا توجد حجوزات قاعات</p>
          </div>
        ) : (
          hallBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-luxe rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                className="w-full p-4 text-right"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getHallStatusBadge(booking.status)}
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

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="font-bold text-primary">
                    {booking.total_price?.toLocaleString()} ر.س
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{format(new Date(booking.booking_date), "d MMMM yyyy", { locale: ar })}</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </button>

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

                      <div className={`rounded-xl p-3 text-center text-sm ${
                        booking.status === "accepted" ? "bg-green-500/10 text-green-700" :
                        booking.status === "rejected" ? "bg-red-500/10 text-red-700" :
                        booking.status === "pending" ? "bg-amber-500/10 text-amber-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {getStatusMessage(booking.status)}
                      </div>

                      {/* Rate Button for accepted hall bookings */}
                      {booking.status === "accepted" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setReviewHallBooking(booking)}
                        >
                          <Star className="w-4 h-4 ml-2" />
                          {hallReviews.find(r => r.hall_id === booking.hall_id)
                            ? "تعديل التقييم"
                            : "قيّم القاعة"}
                        </Button>
                      )}

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
          ))
        )}
      </TabsContent>
    </Tabs>

    {/* Service Review Sheet */}
    {reviewServiceBooking && (
      <AddVendorReviewSheet
        open={!!reviewServiceBooking}
        onOpenChange={(open) => !open && setReviewServiceBooking(null)}
        providerId={reviewServiceBooking.provider_id}
        providerName={reviewServiceBooking.service_providers?.name_ar || "مقدم الخدمة"}
        existingReview={serviceReviews.find(r => r.provider_id === reviewServiceBooking.provider_id) || null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['user-service-reviews'] });
          setReviewServiceBooking(null);
        }}
      />
    )}

    {/* Hall Review Sheet */}
    {reviewHallBooking && (
      <AddHallReviewSheet
        open={!!reviewHallBooking}
        onOpenChange={(open) => !open && setReviewHallBooking(null)}
        hallId={reviewHallBooking.hall_id}
        hallName={reviewHallBooking.halls?.name_ar || "القاعة"}
        bookingId={reviewHallBooking.id}
        existingReview={hallReviews.find(r => r.hall_id === reviewHallBooking.hall_id) || null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['user-hall-reviews'] });
          setReviewHallBooking(null);
        }}
      />
    )}
  </>
  );
}
