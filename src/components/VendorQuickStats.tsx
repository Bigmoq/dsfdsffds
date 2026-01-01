import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, DollarSign, Star, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "./ui/skeleton";

interface QuickStats {
  newBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingBookings: number;
  revenueChange: number;
  bookingsChange: number;
}

export function VendorQuickStats() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && role) {
      fetchStats();
    }
  }, [user, role]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      let newBookings = 0;
      let totalRevenue = 0;
      let averageRating = 0;
      let pendingBookings = 0;
      let lastMonthRevenue = 0;
      let lastMonthBookings = 0;

      if (role === "hall_owner") {
        // Fetch hall owner stats
        const { data: halls } = await supabase
          .from("halls")
          .select("id")
          .eq("owner_id", user.id);

        if (halls && halls.length > 0) {
          const hallIds = halls.map(h => h.id);

          // Current month bookings
          const { data: bookings } = await supabase
            .from("hall_bookings")
            .select("id, total_price, status, created_at")
            .in("hall_id", hallIds);

          if (bookings) {
            // This month's new bookings
            newBookings = bookings.filter(b => 
              new Date(b.created_at) >= startOfMonth
            ).length;

            // Total revenue (accepted bookings)
            totalRevenue = bookings
              .filter(b => b.status === "accepted")
              .reduce((sum, b) => sum + (b.total_price || 0), 0);

            // Pending bookings
            pendingBookings = bookings.filter(b => b.status === "pending").length;

            // Last month stats for comparison
            lastMonthBookings = bookings.filter(b => {
              const date = new Date(b.created_at);
              return date >= startOfLastMonth && date <= endOfLastMonth;
            }).length;

            lastMonthRevenue = bookings
              .filter(b => {
                const date = new Date(b.created_at);
                return b.status === "accepted" && date >= startOfLastMonth && date <= endOfLastMonth;
              })
              .reduce((sum, b) => sum + (b.total_price || 0), 0);
          }

          // Get average rating for all halls
          let totalRating = 0;
          let ratingCount = 0;
          for (const hallId of hallIds) {
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
          const providerIds = providers.map(p => p.id);

          // Get bookings
          const { data: bookings } = await supabase
            .from("service_bookings")
            .select("id, total_price, status, created_at")
            .in("provider_id", providerIds);

          if (bookings) {
            newBookings = bookings.filter(b => 
              new Date(b.created_at) >= startOfMonth
            ).length;

            totalRevenue = bookings
              .filter(b => b.status === "confirmed" || b.status === "completed")
              .reduce((sum, b) => sum + (b.total_price || 0), 0);

            pendingBookings = bookings.filter(b => b.status === "pending").length;

            lastMonthBookings = bookings.filter(b => {
              const date = new Date(b.created_at);
              return date >= startOfLastMonth && date <= endOfLastMonth;
            }).length;

            lastMonthRevenue = bookings
              .filter(b => {
                const date = new Date(b.created_at);
                return (b.status === "confirmed" || b.status === "completed") && 
                       date >= startOfLastMonth && date <= endOfLastMonth;
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
      const revenueChange = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : totalRevenue > 0 ? 100 : 0;
      
      const bookingsChange = lastMonthBookings > 0 
        ? ((newBookings - lastMonthBookings) / lastMonthBookings) * 100 
        : newBookings > 0 ? 100 : 0;

      setStats({
        newBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingBookings,
        revenueChange: Math.round(revenueChange),
        bookingsChange: Math.round(bookingsChange),
      });
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

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
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
  );
}
