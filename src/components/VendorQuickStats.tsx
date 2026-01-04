import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, DollarSign, Star, Clock, TrendingUp, TrendingDown, Calendar, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import { useServiceBookingNotifications } from "@/hooks/useServiceBookingNotifications";
import { Skeleton } from "./ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type TimePeriod = "week" | "month" | "year";

interface QuickStats {
  newBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingBookings: number;
  revenueChange: number;
  bookingsChange: number;
}

interface WeeklyData {
  day: string;
  bookings: number;
}

export function VendorQuickStats() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [hallIds, setHallIds] = useState<string[]>([]);
  const [providerIds, setProviderIds] = useState<string[]>([]);

  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  // Callback for new bookings
  const handleNewBooking = useCallback(() => {
    toast({
      title: "🔔 حجز جديد!",
      description: "تم استلام طلب حجز جديد - جاري تحديث الإحصائيات",
      duration: 5000,
    });
    fetchStats();
  }, []);

  // Real-time notifications for hall owners
  useBookingNotifications({ hallIds, onNewBooking: handleNewBooking });

  // Real-time notifications for service providers
  useServiceBookingNotifications({ providerIds, onNewBooking: handleNewBooking });

  useEffect(() => {
    if (user && role) {
      fetchStats();
    }
  }, [user, role, timePeriod]);

  const getDateRanges = () => {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (timePeriod) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        previousStartDate = new Date(now);
        previousStartDate.setDate(now.getDate() - 14);
        previousEndDate = new Date(now);
        previousEndDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    return { startDate, previousStartDate, previousEndDate };
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const { startDate, previousStartDate, previousEndDate } = getDateRanges();

      // Get start of current week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      let newBookings = 0;
      let totalRevenue = 0;
      let averageRating = 0;
      let pendingBookings = 0;
      let previousRevenue = 0;
      let previousBookings = 0;
      let weeklyBookings: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      if (role === "hall_owner") {
        // Fetch hall owner stats
        const { data: halls } = await supabase
          .from("halls")
          .select("id")
          .eq("owner_id", user.id);

        if (halls && halls.length > 0) {
          const fetchedHallIds = halls.map(h => h.id);
          setHallIds(fetchedHallIds);

          // Current month bookings
          const { data: bookings } = await supabase
            .from("hall_bookings")
            .select("id, total_price, status, created_at, booking_date")
            .in("hall_id", fetchedHallIds);

          if (bookings) {
            // This period's new bookings
            newBookings = bookings.filter(b => 
              new Date(b.created_at) >= startDate
            ).length;

            // Total revenue (accepted bookings) in this period
            totalRevenue = bookings
              .filter(b => b.status === "accepted" && new Date(b.created_at) >= startDate)
              .reduce((sum, b) => sum + (b.total_price || 0), 0);

            // Pending bookings
            pendingBookings = bookings.filter(b => b.status === "pending").length;

            // Weekly distribution (by booking_date)
            bookings.forEach(b => {
              const bookingDate = new Date(b.booking_date);
              if (bookingDate >= startOfWeek) {
                const dayOfWeek = bookingDate.getDay();
                weeklyBookings[dayOfWeek] = (weeklyBookings[dayOfWeek] || 0) + 1;
              }
            });

            // Previous period stats for comparison
            previousBookings = bookings.filter(b => {
              const date = new Date(b.created_at);
              return date >= previousStartDate && date <= previousEndDate;
            }).length;

            previousRevenue = bookings
              .filter(b => {
                const date = new Date(b.created_at);
                return b.status === "accepted" && date >= previousStartDate && date <= previousEndDate;
              })
              .reduce((sum, b) => sum + (b.total_price || 0), 0);
          }

          // Get average rating for all halls
          let totalRating = 0;
          let ratingCount = 0;
          for (const hallId of fetchedHallIds) {
            const { data: ratingData } = await supabase.rpc("get_hall_rating", { hall_uuid: hallId });
            if (ratingData && ratingData[0]) {
              totalRating += Number(ratingData[0].average_rating) * Number(ratingData[0].reviews_count);
              ratingCount += Number(ratingData[0].reviews_count);
            }
          }
          averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        }
      } else if (role === "service_provider") {
        // Fetch service provider stats
        const { data: providers } = await supabase
          .from("service_providers")
          .select("id, rating, reviews_count")
          .eq("owner_id", user.id);

        if (providers && providers.length > 0) {
          const fetchedProviderIds = providers.map(p => p.id);
          setProviderIds(fetchedProviderIds);

          // Get bookings
          const { data: bookings } = await supabase
            .from("service_bookings")
            .select("id, total_price, status, created_at, booking_date")
            .in("provider_id", fetchedProviderIds);

          if (bookings) {
            newBookings = bookings.filter(b => 
              new Date(b.created_at) >= startDate
            ).length;

            totalRevenue = bookings
              .filter(b => (b.status === "confirmed" || b.status === "completed") && new Date(b.created_at) >= startDate)
              .reduce((sum, b) => sum + (b.total_price || 0), 0);

            pendingBookings = bookings.filter(b => b.status === "pending").length;

            // Weekly distribution (by booking_date)
            bookings.forEach(b => {
              const bookingDate = new Date(b.booking_date);
              if (bookingDate >= startOfWeek) {
                const dayOfWeek = bookingDate.getDay();
                weeklyBookings[dayOfWeek] = (weeklyBookings[dayOfWeek] || 0) + 1;
              }
            });

            previousBookings = bookings.filter(b => {
              const date = new Date(b.created_at);
              return date >= previousStartDate && date <= previousEndDate;
            }).length;

            previousRevenue = bookings
              .filter(b => {
                const date = new Date(b.created_at);
                return (b.status === "confirmed" || b.status === "completed") && 
                       date >= previousStartDate && date <= previousEndDate;
              })
              .reduce((sum, b) => sum + (b.total_price || 0), 0);
          }

          // Calculate average rating
          let totalRating = 0;
          let ratingCount = 0;
          providers.forEach(p => {
            if (p.rating && p.reviews_count) {
              totalRating += Number(p.rating) * Number(p.reviews_count);
              ratingCount += Number(p.reviews_count);
            }
          });
          averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        }
      } else if (role === "dress_seller") {
        // Fetch dress seller stats
        const { data: dresses } = await supabase
          .from("dresses")
          .select("id, price, is_sold, is_active, created_at")
          .eq("seller_id", user.id);

        if (dresses) {
          // Count sold dresses this month as "bookings"
          newBookings = dresses.filter(d => d.is_sold).length;
          
          // Revenue from sold dresses
          totalRevenue = dresses
            .filter(d => d.is_sold)
            .reduce((sum, d) => sum + (d.price || 0), 0);

          // Active (unsold) dresses as "pending"
          pendingBookings = dresses.filter(d => !d.is_sold && d.is_active !== false).length;
        }
      }

      // Calculate changes
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : totalRevenue > 0 ? 100 : 0;
      
      const bookingsChange = previousBookings > 0 
        ? ((newBookings - previousBookings) / previousBookings) * 100 
        : newBookings > 0 ? 100 : 0;

      setStats({
        newBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingBookings,
        revenueChange: Math.round(revenueChange),
        bookingsChange: Math.round(bookingsChange),
      });

      // Set weekly data
      const weeklyDataArray: WeeklyData[] = dayNames.map((day, index) => ({
        day,
        bookings: weeklyBookings[index] || 0,
      }));
      setWeeklyData(weeklyDataArray);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " ر.س";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getPendingLabel = () => {
    if (role === "dress_seller") return "فساتين نشطة";
    return "قيد الانتظار";
  };

  const getBookingsLabel = () => {
    if (role === "dress_seller") return "فساتين مباعة";
    return "حجوزات جديدة";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: CalendarCheck,
      label: getBookingsLabel(),
      value: stats.newBookings.toString(),
      change: stats.bookingsChange,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: DollarSign,
      label: "الإيرادات",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Star,
      label: "التقييم",
      value: stats.averageRating > 0 ? stats.averageRating.toString() : "-",
      suffix: stats.averageRating > 0 ? "/5" : "",
      gradient: "from-amber-500 to-yellow-500",
    },
    {
      icon: Clock,
      label: getPendingLabel(),
      value: stats.pendingBookings.toString(),
      gradient: "from-purple-500 to-violet-500",
    },
  ];

  const hasWeeklyData = weeklyData.some(d => d.bookings > 0);

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "week": return "الأسبوع الماضي";
      case "year": return "هذه السنة";
      default: return "هذا الشهر";
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-arabic text-sm text-muted-foreground">{getPeriodLabel()}</span>
        </div>
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-28 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">أسبوع</SelectItem>
            <SelectItem value="month">شهر</SelectItem>
            <SelectItem value="year">سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-arabic text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl font-bold text-foreground">{stat.value}</span>
                {stat.suffix && (
                  <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                )}
              </div>
              {stat.change !== undefined && stat.change !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs ${getChangeColor(stat.change)}`}>
                  {getChangeIcon(stat.change)}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart - only show for hall_owner and service_provider */}
      {role !== "dress_seller" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
        >
          <h4 className="font-arabic text-sm font-medium text-foreground mb-3 text-right">
            توزيع الحجوزات خلال الأسبوع
          </h4>
          {hasWeeklyData ? (
            <div className="h-32" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} حجز`, 'الحجوزات']}
                    labelFormatter={(label) => label}
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="font-arabic text-sm text-muted-foreground">
                لا توجد حجوزات هذا الأسبوع
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
