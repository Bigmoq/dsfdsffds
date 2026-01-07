import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Users, Calendar, Trash2, ClipboardList, Pencil } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { BookingCalendarView } from "./BookingCalendarView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import { AddHallSheet } from "./AddHallSheet";
import { EditHallSheet } from "./EditHallSheet";
import { HallCalendarSheet } from "./HallCalendarSheet";
import { HallBookingManagement } from "./HallBookingManagement";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];

export function HallManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddHall, setShowAddHall] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditHall, setShowEditHall] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState<string | null>(null);

  // Get hall IDs for realtime notifications
  const hallIds = halls.map(h => h.id);

  // Handle new booking notification
  const handleNewBooking = useCallback(() => {
    fetchPendingCount();
    setRefreshKey(prev => prev + 1);
  }, []);

  // Subscribe to real-time booking notifications
  useBookingNotifications({ hallIds, onNewBooking: handleNewBooking });

  useEffect(() => {
    if (user) {
      fetchHalls();
      fetchPendingCount();
    }
  }, [user]);

  const fetchHalls = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("halls")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setHalls(data);
    }
    setLoading(false);
  };

  const fetchPendingCount = async () => {
    if (!user) return;

    // Get halls owned by this user
    const { data: userHalls } = await supabase
      .from("halls")
      .select("id")
      .eq("owner_id", user.id);

    if (!userHalls || userHalls.length === 0) {
      setPendingCount(0);
      return;
    }

    const hallIds = userHalls.map(h => h.id);

    // Count pending bookings
    const { count } = await supabase
      .from("hall_bookings")
      .select("*", { count: "exact", head: true })
      .in("hall_id", hallIds)
      .eq("status", "pending");

    setPendingCount(count || 0);
  };

  const confirmDeleteHall = (hallId: string) => {
    setHallToDelete(hallId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteHall = async () => {
    if (!hallToDelete) return;
    
    const { error } = await supabase
      .from("halls")
      .delete()
      .eq("id", hallToDelete);
    
    if (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف القاعة",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحذف",
        description: "تم حذف القاعة بنجاح",
      });
      fetchHalls();
    }
    
    setDeleteDialogOpen(false);
    setHallToDelete(null);
  };

  const openCalendar = (hall: Hall) => {
    setSelectedHall(hall);
    setShowCalendar(true);
  };

  const openEditHall = (hall: Hall) => {
    setEditingHall(hall);
    setShowEditHall(true);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="halls" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 mx-4 max-w-[calc(100%-2rem)]">
          <TabsTrigger value="halls" className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-4 h-4" />
            القاعات
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4" />
            التقويم
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-1.5 text-xs relative">
            <ClipboardList className="w-4 h-4" />
            الحجوزات
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="mt-4">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setShowAddHall(true)}
                className="gold-gradient text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                <span className="font-arabic">إضافة قاعة</span>
              </Button>
              <h2 className="font-display text-xl font-bold text-foreground">
                قاعاتي
              </h2>
            </div>
            
            {halls.length > 0 ? (
              <div className="space-y-4">
                {halls.map((hall, index) => (
                  <motion.div
                    key={hall.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-luxe rounded-xl overflow-hidden"
                  >
                    {hall.cover_image && (
                      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${hall.cover_image})` }} />
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => openCalendar(hall)}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => openEditHall(hall)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => confirmDeleteHall(hall.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {hall.name_ar}
                          </h3>
                          <div className="flex items-center gap-1 justify-end text-muted-foreground text-sm">
                            <span className="font-arabic">{hall.city}</span>
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          <span className="text-muted-foreground font-arabic">
                            أيام الأسبوع: {hall.price_weekday?.toLocaleString()} ر.س
                          </span>
                          <span className="text-muted-foreground font-arabic">
                            نهاية الأسبوع: {hall.price_weekend?.toLocaleString()} ر.س
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="font-arabic">
                            {(hall.capacity_men ?? 0) + (hall.capacity_women ?? 0)}
                          </span>
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  لا توجد قاعات
                </h3>
                <p className="text-muted-foreground font-arabic text-sm mb-4">
                  أضف قاعتك الأولى للبدء في استقبال الحجوزات
                </p>
                <Button onClick={() => setShowAddHall(true)} className="gold-gradient text-white">
                  <Plus className="w-4 h-4 ml-2" />
                  <span className="font-arabic">إضافة قاعة</span>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4 px-4">
          <BookingCalendarView type="hall" />
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <HallBookingManagement refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
      
      <AddHallSheet
        open={showAddHall}
        onOpenChange={setShowAddHall}
        onSuccess={fetchHalls}
      />

      {editingHall && (
        <EditHallSheet
          open={showEditHall}
          onOpenChange={setShowEditHall}
          onSuccess={fetchHalls}
          hall={editingHall}
        />
      )}
      
      {selectedHall && (
        <HallCalendarSheet
          open={showCalendar}
          onOpenChange={setShowCalendar}
          hall={selectedHall}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه القاعة؟ سيتم حذف جميع الحجوزات والبيانات المرتبطة بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHall}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
