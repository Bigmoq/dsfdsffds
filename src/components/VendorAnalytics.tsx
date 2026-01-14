import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  PieChart as PieChartIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    is_paid?: boolean;
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

export function VendorAnalytics() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

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
          .select("*, profiles:user_id(full_name)")
          .in("hall_id", hallIds)
          .order("created_at", { ascending: false });

        allBookings = (bookings || []).map(b => ({
          ...b,
          entity_id: b.hall_id,
          entity_name: entityNames[b.hall_id],
          status: b.status || "pending",
          customer_name: (b.profiles as any)?.full_name || "غير معروف",
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
          .select("*, profiles:user_id(full_name)")
          .in("provider_id", providerIds)
          .order("created_at", { ascending: false });

        allBookings = (bookings || []).map(b => ({
          ...b,
          entity_id: b.provider_id,
          entity_name: entityNames[b.provider_id],
          status: b.status || "pending",
          customer_name: (b.profiles as any)?.full_name || "غير معروف",
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
        is_paid: b.is_paid,
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
          <CardHeader>
            <CardTitle className="font-display text-lg text-right">
              آخر الحجوزات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-arabic">
                لا توجد حجوزات حتى الآن
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
