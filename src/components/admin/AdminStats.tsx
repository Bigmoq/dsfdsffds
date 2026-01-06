import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingBag, 
  Calendar,
  TrendingUp,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalHalls: number;
  totalServices: number;
  totalDresses: number;
  totalHallBookings: number;
  totalServiceBookings: number;
  pendingComplaints: number;
  pendingApplications: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    const [
      { count: usersCount },
      { count: hallsCount },
      { count: servicesCount },
      { count: dressesCount },
      { count: hallBookingsCount },
      { count: serviceBookingsCount },
      { count: complaintsCount },
      { count: applicationsCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("halls").select("*", { count: "exact", head: true }),
      supabase.from("service_providers").select("*", { count: "exact", head: true }),
      supabase.from("dresses").select("*", { count: "exact", head: true }),
      supabase.from("hall_bookings").select("*", { count: "exact", head: true }),
      supabase.from("service_bookings").select("*", { count: "exact", head: true }),
      supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("vendor_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalHalls: hallsCount || 0,
      totalServices: servicesCount || 0,
      totalDresses: dressesCount || 0,
      totalHallBookings: hallBookingsCount || 0,
      totalServiceBookings: serviceBookingsCount || 0,
      pendingComplaints: complaintsCount || 0,
      pendingApplications: applicationsCount || 0,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "المستخدمين", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { label: "القاعات", value: stats?.totalHalls || 0, icon: Building2, color: "text-purple-500" },
    { label: "مقدمي الخدمات", value: stats?.totalServices || 0, icon: Package, color: "text-green-500" },
    { label: "الفساتين", value: stats?.totalDresses || 0, icon: ShoppingBag, color: "text-pink-500" },
    { label: "حجوزات القاعات", value: stats?.totalHallBookings || 0, icon: Calendar, color: "text-orange-500" },
    { label: "حجوزات الخدمات", value: stats?.totalServiceBookings || 0, icon: Calendar, color: "text-teal-500" },
    { label: "شكاوى معلقة", value: stats?.pendingComplaints || 0, icon: TrendingUp, color: "text-red-500" },
    { label: "طلبات بائعين معلقة", value: stats?.pendingApplications || 0, icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-right">نظرة عامة</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-luxe">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground font-arabic">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
