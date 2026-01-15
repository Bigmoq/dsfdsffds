import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  DollarSign, 
  MessageCircle, 
  Users,
  Building2,
  Package,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Loader2,
  PieChart as PieChartIcon,
  Phone,
  User,
  CreditCard,
  Clock,
  MapPin,
  X,
  Check,
  XCircle,
  Ban,
  Filter,
  SlidersHorizontal,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AnalyticsData {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalInquiries: number;
  revenueChange: number;
  bookingsChange: number;
  avgBookingValue: number;
  conversionRate: number;
  bookingsByDay: { date: string; count: number; revenue: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  recentBookings: {
    id: string;
    booking_date: string;
    total_price: number;
    status: string;
    guest_count_men?: number;
    guest_count_women?: number;
    hall_name?: string;
    provider_name?: string;
    customer_name?: string;
    customer_phone?: string;
    is_paid?: boolean;
    notes?: string;
    created_at?: string;
  }[];
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: "#f59e0b",
  accepted: "#22c55e",
  confirmed: "#22c55e",
  completed: "#3b82f6",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

const STATUS_LABELS: { [key: string]: string } = {
  pending: "قيد الانتظار",
  accepted: "مقبول",
  confirmed: "مؤكد",
  completed: "مكتمل",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

type SelectedBooking = AnalyticsData['recentBookings'][0] | null;

export function VendorAnalytics() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    status: string;
    title: string;
    description: string;
    bookingId?: string;
  }>({ open: false, status: "", title: "", description: "" });
  const [longPressBooking, setLongPressBooking] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const filterOptions = [
    { value: "pending", label: "قيد الانتظار", color: "bg-amber-500", icon: Clock },
    { value: "accepted", label: "مقبول", color: "bg-green-500", icon: Check },
    { value: "confirmed", label: "مؤكد", color: "bg-green-500", icon: Check },
    { value: "completed", label: "مكتمل", color: "bg-blue-500", icon: Check },
    { value: "rejected", label: "مرفوض", color: "bg-red-500", icon: XCircle },
    { value: "cancelled", label: "ملغي", color: "bg-gray-500", icon: Ban },
  ];

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
  };

  const filteredBookings = analytics?.recentBookings.filter(booking => 
    statusFilter.length === 0 || statusFilter.includes(booking.status)
  ) || [];

  const statusConfirmations: { [key: string]: { title: string; description: string } } = {
    accepted: { title: "تأكيد قبول الحجز", description: "هل أنت متأكد من قبول هذا الحجز؟ سيتم إشعار العميل بالموافقة." },
    confirmed: { title: "تأكيد الحجز", description: "هل أنت متأكد من تأكيد هذا الحجز؟ سيتم إشعار العميل." },
    rejected: { title: "تأكيد رفض الحجز", description: "هل أنت متأكد من رفض هذا الحجز؟ سيتم إشعار العميل بالرفض." },
    cancelled: { title: "تأكيد إلغاء الحجز", description: "هل أنت متأكد من إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء." },
    completed: { title: "تأكيد إكمال الحجز", description: "هل أنت متأكد من وضع علامة مكتمل على هذا الحجز؟" },
  };

  const openConfirmDialog = (status: string, bookingId?: string) => {
    const confirmation = statusConfirmations[status] || { title: "تأكيد", description: "هل أنت متأكد؟" };
    setConfirmDialog({ open: true, status, bookingId, ...confirmation });
  };

  const handleConfirmStatusChange = async () => {
    const bookingId = confirmDialog.bookingId || selectedBooking?.id;
    if (bookingId && confirmDialog.status) {
      await handleUpdateStatus(bookingId, confirmDialog.status);
    }
    setConfirmDialog({ open: false, status: "", title: "", description: "" });
  };

  const handleBookingClick = (booking: AnalyticsData['recentBookings'][0]) => {
    setSelectedBooking(booking);
    setSheetOpen(true);
  };

  const handleQuickStatusChange = (booking: AnalyticsData['recentBookings'][0], newStatus: string) => {
    setSelectedBooking(booking);
    openConfirmDialog(newStatus, booking.id);
  };

  const getAvailableStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [
          { value: "accepted", label: "قبول", icon: Check, color: "text-green-600" },
          { value: "rejected", label: "رفض", icon: XCircle, color: "text-red-600" },
        ];
      case "accepted":
        return [
          { value: "confirmed", label: "تأكيد", icon: Check, color: "text-green-600" },
          { value: "cancelled", label: "إلغاء", icon: Ban, color: "text-gray-600" },
        ];
      case "confirmed":
        return [
          { value: "completed", label: "مكتمل", icon: Check, color: "text-blue-600" },
          { value: "cancelled", label: "إلغاء", icon: Ban, color: "text-gray-600" },
        ];
      default:
        return [];
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("966") ? cleanPhone : `966${cleanPhone.replace(/^0/, "")}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!role) return;
    setUpdatingStatus(true);

    try {
      const tableName = role === "hall_owner" ? "hall_bookings" : "service_bookings";
      
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      if (selectedBooking) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      
      // Update analytics state
      if (analytics) {
        const updatedBookings = analytics.recentBookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        );
        setAnalytics({ ...analytics, recentBookings: updatedBookings });
      }

      const statusMessages: { [key: string]: { title: string; description: string } } = {
        accepted: { title: "تم قبول الحجز", description: "سيتم إشعار العميل بالموافقة" },
        confirmed: { title: "تم تأكيد الحجز", description: "سيتم إشعار العميل بالتأكيد" },
        rejected: { title: "تم رفض الحجز", description: "سيتم إشعار العميل بالرفض" },
        cancelled: { title: "تم إلغاء الحجز", description: "تم إلغاء الحجز بنجاح" },
        completed: { title: "تم إكمال الحجز", description: "تم وضع علامة مكتمل على الحجز" },
      };

      const message = statusMessages[newStatus] || { title: "تم التحديث", description: "تم تحديث حالة الحجز" };
      toast({
        title: message.title,
        description: message.description,
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الحجز",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (user && (role === "hall_owner" || role === "service_provider")) {
      fetchAnalytics();
    }
  }, [user, role, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let allBookings: any[] = [];
      let entityNames: { [key: string]: string } = {};

      if (role === "hall_owner") {
        // Fetch user's halls
        const { data: halls } = await supabase
          .from("halls")
          .select("id, name_ar")
          .eq("owner_id", user.id);

        if (!halls || halls.length === 0) {
          setAnalytics({
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalInquiries: 0,
            revenueChange: 0,
            bookingsChange: 0,
            avgBookingValue: 0,
            conversionRate: 0,
            bookingsByDay: [],
            statusDistribution: [],
            recentBookings: [],
          });
          setLoading(false);
          return;
        }

        const hallIds = halls.map(h => h.id);
        halls.forEach(h => { entityNames[h.id] = h.name_ar; });

        // Fetch all bookings for user's halls with customer info
        const { data: bookings } = await supabase
          .from("hall_bookings")
          .select("*, profiles:user_id(full_name, phone)")
          .in("hall_id", hallIds)
          .order("created_at", { ascending: false });

        allBookings = (bookings || []).map(b => ({
          ...b,
          entity_id: b.hall_id,
          entity_name: entityNames[b.hall_id],
          status: b.status || "pending",
          customer_name: (b.profiles as any)?.full_name || "غير معروف",
          customer_phone: (b.profiles as any)?.phone || null,
          is_paid: !!b.stripe_payment_id,
        }));
      } else if (role === "service_provider") {
        // Fetch user's service providers
        const { data: providers } = await supabase
          .from("service_providers")
          .select("id, name_ar")
          .eq("owner_id", user.id);

        if (!providers || providers.length === 0) {
          setAnalytics({
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalInquiries: 0,
            revenueChange: 0,
            bookingsChange: 0,
            avgBookingValue: 0,
            conversionRate: 0,
            bookingsByDay: [],
            statusDistribution: [],
            recentBookings: [],
          });
          setLoading(false);
          return;
        }

        const providerIds = providers.map(p => p.id);
        providers.forEach(p => { entityNames[p.id] = p.name_ar; });

        // Fetch all bookings for user's providers with customer info
        const { data: bookings } = await supabase
          .from("service_bookings")
          .select("*, profiles:user_id(full_name, phone)")
          .in("provider_id", providerIds)
          .order("created_at", { ascending: false });

        allBookings = (bookings || []).map(b => ({
          ...b,
          entity_id: b.provider_id,
          entity_name: entityNames[b.provider_id],
          status: b.status || "pending",
          customer_name: (b.profiles as any)?.full_name || "غير معروف",
          customer_phone: (b.profiles as any)?.phone || null,
          is_paid: false, // Service bookings don't have payment tracking yet
        }));
      }

      // Calculate date ranges
      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      const endOfThisMonth = endOfMonth(now);
      const startOfLastMonth = startOfMonth(subDays(startOfThisMonth, 1));
      const endOfLastMonth = endOfMonth(startOfLastMonth);

      // Filter bookings by time range
      const daysBack = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
      const rangeStart = subDays(now, daysBack);

      const bookingsInRange = allBookings.filter(b => 
        new Date(b.created_at!) >= rangeStart
      );

      // This month's bookings
      const thisMonthBookings = allBookings.filter(b => {
        const date = new Date(b.created_at!);
        return date >= startOfThisMonth && date <= endOfThisMonth;
      });

      // Last month's bookings
      const lastMonthBookings = allBookings.filter(b => {
        const date = new Date(b.created_at!);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });

      // Calculate metrics
      const totalBookings = allBookings.length;
      const pendingBookings = allBookings.filter(b => b.status === "pending").length;
      const confirmedStatuses = role === "hall_owner" ? ["accepted"] : ["confirmed", "completed"];
      const confirmedBookings = allBookings.filter(b => confirmedStatuses.includes(b.status)).length;
      
      const acceptedBookings = allBookings.filter(b => confirmedStatuses.includes(b.status));
      const totalRevenue = acceptedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const avgBookingValue = acceptedBookings.length > 0 ? totalRevenue / acceptedBookings.length : 0;
      const conversionRate = totalBookings > 0 ? (acceptedBookings.length / totalBookings) * 100 : 0;

      const monthlyRevenue = thisMonthBookings
        .filter(b => confirmedStatuses.includes(b.status))
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      const lastMonthRevenue = lastMonthBookings
        .filter(b => confirmedStatuses.includes(b.status))
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      const revenueChange = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : monthlyRevenue > 0 ? 100 : 0;

      const bookingsChange = lastMonthBookings.length > 0
        ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100
        : thisMonthBookings.length > 0 ? 100 : 0;

      // Status distribution
      const statusCounts: { [key: string]: number } = {};
      allBookings.forEach(b => {
        const status = b.status || "pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        color: STATUS_COLORS[status] || "#6b7280",
      }));

      // Prepare chart data
      const days = eachDayOfInterval({ start: rangeStart, end: now });
      const bookingsByDay = days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayBookings = bookingsInRange.filter(b => 
          format(new Date(b.created_at!), "yyyy-MM-dd") === dayStr
        );
        return {
          date: format(day, "dd MMM", { locale: ar }),
          count: dayBookings.length,
          revenue: dayBookings
            .filter(b => confirmedStatuses.includes(b.status))
            .reduce((sum, b) => sum + (b.total_price || 0), 0),
        };
      });

      // Recent bookings
      const recentBookings = allBookings.slice(0, 5).map(b => ({
        id: b.id,
        booking_date: b.booking_date,
        total_price: b.total_price || 0,
        status: b.status || "pending",
        guest_count_men: b.guest_count_men || 0,
        guest_count_women: b.guest_count_women || 0,
        hall_name: role === "hall_owner" ? b.entity_name : undefined,
        provider_name: role === "service_provider" ? b.entity_name : undefined,
        customer_name: b.customer_name,
        customer_phone: b.customer_phone,
        is_paid: b.is_paid,
        notes: b.notes,
        created_at: b.created_at,
      }));

      setAnalytics({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        monthlyRevenue,
        totalInquiries: 0,
        revenueChange,
        bookingsChange,
        avgBookingValue: Math.round(avgBookingValue),
        conversionRate: Math.round(conversionRate),
        bookingsByDay,
        statusDistribution,
        recentBookings,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-arabic">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد المراجعة",
      accepted: "مؤكد",
      cancelled: "ملغي",
      rejected: "مرفوض",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600",
      accepted: "bg-green-500/20 text-green-600",
      cancelled: "bg-red-500/20 text-red-600",
      rejected: "bg-red-500/20 text-red-600",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          التحليلات والإحصائيات
        </h2>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-arabic transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range === "week" ? "أسبوع" : range === "month" ? "شهر" : "سنة"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  analytics.bookingsChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {analytics.bookingsChange >= 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {Math.abs(analytics.bookingsChange).toFixed(0)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.totalBookings}</p>
              <p className="text-xs text-muted-foreground font-arabic">إجمالي الحجوزات</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  analytics.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {analytics.revenueChange >= 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {Math.abs(analytics.revenueChange).toFixed(0)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {analytics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-arabic">إجمالي الإيرادات (ر.س)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.avgBookingValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-arabic">متوسط قيمة الحجز (ر.س)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.conversionRate}%</p>
              <p className="text-xs text-muted-foreground font-arabic">معدل التحويل</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.pendingBookings}</p>
              <p className="text-xs text-muted-foreground font-arabic">حجوزات قيد المراجعة</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.confirmedBookings}</p>
              <p className="text-xs text-muted-foreground font-arabic">حجوزات مؤكدة</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-luxe">
          <CardHeader>
            <CardTitle className="font-display text-lg text-right">
              الإيرادات والحجوزات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bookingsByDay.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.bookingsByDay}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        direction: "rtl",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `${value.toLocaleString()} ر.س` : value,
                        name === "revenue" ? "الإيرادات" : "الحجوزات"
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-arabic">
                لا توجد بيانات للعرض
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bookings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-luxe">
          <CardHeader>
            <CardTitle className="font-display text-lg text-right">
              عدد الحجوزات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bookingsByDay.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.bookingsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        direction: "rtl",
                      }}
                      formatter={(value: number) => [value, "الحجوزات"]}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground font-arabic">
                لا توجد بيانات للعرض
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Distribution Pie Chart */}
      {analytics.statusDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="card-luxe">
            <CardHeader>
              <CardTitle className="font-display text-lg text-right">
                توزيع حالات الحجوزات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        direction: "rtl",
                      }}
                      formatter={(value: number, name: string) => [`${value} حجز`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analytics.statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-arabic text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="card-luxe">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-arabic">تصفية</span>
                {statusFilter.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {statusFilter.length}
                  </span>
                )}
              </Button>
              <CardTitle className="font-display text-lg text-right">
                آخر الحجوزات
              </CardTitle>
            </div>
            
            {/* Advanced Filter Section */}
            <motion.div
              initial={false}
              animate={{ 
                height: showFilters ? "auto" : 0,
                opacity: showFilters ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                    disabled={statusFilter.length === 0}
                  >
                    <X className="w-3 h-3" />
                    مسح الكل
                  </Button>
                  <p className="text-sm font-arabic text-muted-foreground">اختر حالات الحجز للتصفية</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  {filterOptions.map((option) => {
                    const isSelected = statusFilter.includes(option.value);
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleStatusFilter(option.value)}
                        className={`
                          relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-arabic
                          transition-all duration-200 border
                          ${isSelected 
                            ? `${option.color} text-white border-transparent shadow-lg` 
                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow"
                          >
                            <Check className="w-3 h-3 text-green-600" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Quick Stats for Selected Filters */}
                {statusFilter.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-3 mt-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <span className="text-sm font-arabic text-primary font-medium">
                          {filteredBookings.length} حجز
                        </span>
                      </div>
                      <span className="text-xs font-arabic text-muted-foreground">
                        من أصل {analytics?.recentBookings.length || 0}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="space-y-3">
                {filteredBookings.map((booking, index) => {
                  const availableActions = getAvailableStatusActions(booking.status);
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors group"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex items-center gap-2">
                        {/* Quick Actions Dropdown */}
                        {availableActions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                              <DropdownMenuLabel className="font-arabic text-right">تغيير الحالة</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {availableActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                  <DropdownMenuItem
                                    key={action.value}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(booking, action.value);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Icon className={`h-4 w-4 ${action.color}`} />
                                    <span className="font-arabic">{action.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-xs font-arabic ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        <span className="font-bold text-foreground">
                          {booking.total_price.toLocaleString()} ر.س
                        </span>
                        {booking.is_paid ? (
                          <span className="px-2 py-1 rounded-lg text-xs font-arabic bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            مدفوع
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg text-xs font-arabic bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            غير مدفوع
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-arabic text-sm font-medium text-foreground">
                          {booking.customer_name || "غير معروف"}
                        </p>
                        <p className="font-arabic text-xs text-muted-foreground">
                          {booking.hall_name || booking.provider_name || (role === "hall_owner" ? "قاعة" : "خدمة")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.booking_date), "d MMMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-arabic">
                  {statusFilter.length > 0 
                    ? "لا توجد حجوزات تطابق معايير التصفية"
                    : "لا توجد حجوزات حتى الآن"
                  }
                </p>
                {statusFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 gap-1 font-arabic"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4" />
                    مسح التصفية
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-right pb-4 border-b">
            <SheetTitle className="font-display text-xl">تفاصيل الحجز</SheetTitle>
          </SheetHeader>
          
          {selectedBooking && (
            <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Customer Info */}
              <div className="bg-muted/50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-arabic font-medium text-foreground">
                      {selectedBooking.customer_name || "غير معروف"}
                    </p>
                    <p className="text-sm text-muted-foreground">العميل</p>
                  </div>
                </div>
                
                {selectedBooking.customer_phone && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => handleCall(selectedBooking.customer_phone!)}
                    >
                      <Phone className="w-4 h-4" />
                      اتصال
                    </Button>
                    <Button 
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(selectedBooking.customer_phone!)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب
                    </Button>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="font-arabic font-medium text-foreground text-right">تفاصيل الحجز</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">التاريخ</span>
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-arabic font-medium">
                      {format(new Date(selectedBooking.booking_date), "d MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">السعر</span>
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-arabic font-medium">
                      {selectedBooking.total_price.toLocaleString()} ر.س
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">الحالة</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-arabic ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">الدفع</span>
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {selectedBooking.is_paid ? (
                      <span className="px-2 py-1 rounded-lg text-xs font-arabic bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        مدفوع
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-xs font-arabic bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        غير مدفوع
                      </span>
                    )}
                  </div>
                </div>

                {/* Hall/Service Name */}
                <div className="bg-muted/50 rounded-xl p-3 text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-sm text-muted-foreground">
                      {role === "hall_owner" ? "القاعة" : "الخدمة"}
                    </span>
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-arabic font-medium">
                    {selectedBooking.hall_name || selectedBooking.provider_name || "-"}
                  </p>
                </div>

                {/* Guest Count (for halls) */}
                {role === "hall_owner" && (selectedBooking.guest_count_men || selectedBooking.guest_count_women) && (
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">عدد الضيوف</span>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-arabic font-medium">
                      {selectedBooking.guest_count_men || 0} رجال • {selectedBooking.guest_count_women || 0} نساء
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="bg-muted/50 rounded-xl p-3 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-sm text-muted-foreground">ملاحظات</span>
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-arabic text-sm text-foreground">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {/* Created At */}
                {selectedBooking.created_at && (
                  <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                    تم إنشاء الحجز في {format(new Date(selectedBooking.created_at), "d MMMM yyyy - HH:mm", { locale: ar })}
                  </div>
                )}

                {/* Status Actions */}
                {selectedBooking.status === "pending" && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-arabic font-medium text-foreground text-right">إجراءات الحجز</h3>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => openConfirmDialog(role === "hall_owner" ? "accepted" : "confirmed")}
                        disabled={updatingStatus}
                      >
                        <Check className="w-4 h-4" />
                        قبول الحجز
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => openConfirmDialog("rejected")}
                        disabled={updatingStatus}
                      >
                        <XCircle className="w-4 h-4" />
                        رفض الحجز
                      </Button>
                    </div>
                  </div>
                )}

                {(selectedBooking.status === "accepted" || selectedBooking.status === "confirmed") && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-arabic font-medium text-foreground text-right">إجراءات الحجز</h3>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => openConfirmDialog("completed")}
                        disabled={updatingStatus}
                      >
                        <Check className="w-4 h-4" />
                        وضع علامة مكتمل
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => openConfirmDialog("cancelled")}
                        disabled={updatingStatus}
                      >
                        <Ban className="w-4 h-4" />
                        إلغاء الحجز
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right font-arabic">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-right font-arabic">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={updatingStatus}
              className={confirmDialog.status === "rejected" || confirmDialog.status === "cancelled" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تأكيد
            </AlertDialogAction>
            <AlertDialogCancel disabled={updatingStatus}>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
