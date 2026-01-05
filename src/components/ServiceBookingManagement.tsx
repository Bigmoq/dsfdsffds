import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  CalendarDays, User, Package, Clock, CheckCircle, XCircle, 
  Loader2, MessageCircle, Phone, FileText, ChevronDown, RefreshCw,
  Ban, RotateCcw, CheckCircle2, Tag, Percent
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useServiceBookingNotifications } from "@/hooks/useServiceBookingNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useToast } from "@/hooks/use-toast";

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
    name_en: string | null;
  } | null;
}

interface BookingWithProfile extends ServiceBooking {
  userProfile?: {
    full_name: string | null;
    phone: string | null;
  };
}

export function ServiceBookingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [resaleDialogOpen, setResaleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfile | null>(null);
  const [resaleDiscount, setResaleDiscount] = useState<number>(10);

  const handleNewBooking = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
  }, [queryClient]);

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

  const providerIds = providers?.map(p => p.id) || [];

  useServiceBookingNotifications({ providerIds, onNewBooking: handleNewBooking });

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['service-bookings', providers?.map(p => p.id)],
    queryFn: async () => {
      if (!providers?.length) return [];
      
      const providerIds = providers.map(p => p.id);
      
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service_packages (
            name_ar,
            name_en
          )
        `)
        .in('provider_id', providerIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const userIds = [...new Set((data || []).map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);
      
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(booking => ({
        ...booking,
        userProfile: profilesMap.get(booking.user_id),
      })) as BookingWithProfile[];
    },
    enabled: !!providers?.length,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الحجز بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحجز",
        variant: "destructive",
      });
    },
  });

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    updateStatusMutation.mutate({ bookingId: selectedBooking.id, status: 'cancelled' });
    
    // Update provider availability
    if (selectedBooking.provider_id) {
      await supabase
        .from("service_provider_availability")
        .upsert({
          provider_id: selectedBooking.provider_id,
          date: selectedBooking.booking_date,
          status: "available",
          notes: "تم إلغاء الحجز السابق"
        }, { onConflict: 'provider_id,date' });
    }
    
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleResaleBooking = async () => {
    if (!selectedBooking) return;
    
    // Update provider availability to show discount
    if (selectedBooking.provider_id) {
      await supabase
        .from("service_provider_availability")
        .upsert({
          provider_id: selectedBooking.provider_id,
          date: selectedBooking.booking_date,
          status: "available",
          notes: `إعادة بيع بخصم ${resaleDiscount}%`
        }, { onConflict: 'provider_id,date' });
    }
    
    updateStatusMutation.mutate({ bookingId: selectedBooking.id, status: 'cancelled' });
    
    toast({
      title: "تم عرض الموعد للبيع",
      description: `سيظهر الموعد للعملاء بخصم ${resaleDiscount}%`,
    });
    
    setResaleDialogOpen(false);
    setSelectedBooking(null);
    setResaleDiscount(10);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">قيد الانتظار</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">مؤكد</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">مكتمل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const completedBookings = bookings?.filter(b => b.status === 'completed' || b.status === 'cancelled') || [];

  const handleWhatsApp = (phone: string | null | undefined, bookingInfo: string) => {
    if (!phone) return;
    const message = encodeURIComponent(`مرحباً، بخصوص حجزك: ${bookingInfo}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string | null | undefined) => {
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const BookingCard = ({ booking }: { booking: BookingWithProfile }) => {
    const isExpanded = expandedBooking === booking.id;
    const providerName = providers?.find(p => p.id === booking.provider_id)?.name_ar || '';
    
    return (
      <Collapsible open={isExpanded} onOpenChange={() => setExpandedBooking(isExpanded ? null : booking.id)}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-4">
              <div className="flex items-start justify-between">
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                <div className="flex-1 text-right mr-3">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {getStatusBadge(booking.status)}
                    <CardTitle className="text-base font-bold">
                      {booking.userProfile?.full_name || 'عميل'}
                    </CardTitle>
                  </div>
                  <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
                    <span>{format(new Date(booking.booking_date), 'dd MMM yyyy', { locale: ar })}</span>
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="font-bold text-primary">{booking.total_price.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4 space-y-4">
              {/* Booking Details */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm">{booking.service_packages?.name_ar || 'باقة غير محددة'}</span>
                  <Package className="w-4 h-4 text-primary" />
                </div>
                {booking.notes && (
                  <div className="flex items-start justify-end gap-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                )}
              </div>

              {/* Contact Buttons */}
              {booking.userProfile?.phone && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCall(booking.userProfile?.phone)}
                  >
                    <Phone className="w-4 h-4 ml-1" />
                    اتصال
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                    onClick={() => handleWhatsApp(booking.userProfile?.phone, `${booking.service_packages?.name_ar} - ${format(new Date(booking.booking_date), 'dd/MM/yyyy')}`)}
                  >
                    <MessageCircle className="w-4 h-4 ml-1" />
                    واتساب
                  </Button>
                </div>
              )}

              {/* Action Buttons for pending bookings */}
              {booking.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 ml-1" />
                        تأكيد
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Actions for confirmed bookings */}
              {booking.status === 'confirmed' && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setResaleDialogOpen(true);
                      }}
                    >
                      <Tag className="w-4 h-4 ml-1" />
                      إعادة بيع
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setCancelDialogOpen(true);
                      }}
                    >
                      <Ban className="w-4 h-4 ml-1" />
                      إلغاء
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'pending' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4 ml-1" />
                      إعادة للمراجعة
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      تحديد كمكتمل
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl font-bold">إدارة الحجوزات</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-amber-500/10">
          <div className="text-2xl font-bold text-amber-600">{pendingBookings.length}</div>
          <div className="text-xs text-muted-foreground">قيد الانتظار</div>
        </Card>
        <Card className="p-3 text-center bg-green-500/10">
          <div className="text-2xl font-bold text-green-600">{confirmedBookings.length}</div>
          <div className="text-xs text-muted-foreground">مؤكد</div>
        </Card>
        <Card className="p-3 text-center bg-blue-500/10">
          <div className="text-2xl font-bold text-blue-600">{completedBookings.length}</div>
          <div className="text-xs text-muted-foreground">مكتمل</div>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            قيد الانتظار
            {pendingBookings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">مؤكد</TabsTrigger>
          <TabsTrigger value="completed">مكتمل</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد حجوزات قيد الانتظار</p>
            </div>
          ) : (
            pendingBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookingCard booking={booking} />
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 space-y-3">
          {confirmedBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد حجوزات مؤكدة</p>
            </div>
          ) : (
            confirmedBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookingCard booking={booking} />
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {completedBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد حجوزات مكتملة</p>
            </div>
          ) : (
            completedBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookingCard booking={booking} />
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

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
                <span className="font-bold">{selectedBooking?.service_packages?.name_ar || 'خدمة'}</span>
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{format(new Date(selectedBooking?.booking_date || new Date()), "d MMMM yyyy", { locale: ar })}</span>
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{selectedBooking?.total_price?.toLocaleString()} ر.س</span>
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
                السعر بعد الخصم: {((selectedBooking?.total_price || 0) * (1 - resaleDiscount / 100)).toLocaleString()} ر.س
              </p>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setResaleDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleResaleBooking}
              disabled={updateStatusMutation.isPending}
              className="gold-gradient"
            >
              {updateStatusMutation.isPending ? (
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