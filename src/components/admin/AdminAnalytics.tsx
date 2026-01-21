import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Smartphone, 
  Monitor, 
  Tablet,
  Calendar,
  Loader2,
  Eye,
  Heart,
  MessageSquare,
  CalendarCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_category: string;
  event_data: Record<string, unknown>;
  page_path: string;
  device_type: string;
  created_at: string;
  user_id: string | null;
}

interface CategoryCount {
  name: string;
  value: number;
  nameAr: string;
}

interface DailyStats {
  date: string;
  events: number;
  users: number;
}

const COLORS = ["#C9902B", "#8B6914", "#DEB86C", "#A67C21", "#F5E6C8"];

const categoryLabels: Record<string, string> = {
  navigation: "التنقل",
  engagement: "التفاعل",
  booking: "الحجوزات",
  search: "البحث",
  auth: "المصادقة",
  vendor: "البائعين",
  chat: "المحادثات",
  favorite: "المفضلة",
};

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(10000);

    if (!error && data) {
      setEvents(data as AnalyticsEvent[]);
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
  const uniqueSessions = new Set(events.map(e => e.event_data?.session_id || e.id)).size;

  // Category breakdown
  const categoryBreakdown: CategoryCount[] = Object.entries(
    events.reduce((acc, event) => {
      acc[event.event_category] = (acc[event.event_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    nameAr: categoryLabels[name] || name,
  }));

  // Device breakdown
  const deviceBreakdown = Object.entries(
    events.reduce((acc, event) => {
      const device = event.device_type || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Top pages
  const topPages = Object.entries(
    events.reduce((acc, event) => {
      const page = event.page_path || "/";
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));

  // Daily stats
  const dailyStats: DailyStats[] = Object.entries(
    events.reduce((acc, event) => {
      const date = new Date(event.created_at).toLocaleDateString("ar-SA");
      if (!acc[date]) {
        acc[date] = { events: 0, users: new Set<string>() };
      }
      acc[date].events++;
      if (event.user_id) {
        acc[date].users.add(event.user_id);
      }
      return acc;
    }, {} as Record<string, { events: number; users: Set<string> }>)
  )
    .map(([date, data]) => ({
      date,
      events: data.events,
      users: data.users.size,
    }))
    .slice(0, 14)
    .reverse();

  // Top events
  const topEvents = Object.entries(
    events.reduce((acc, event) => {
      acc[event.event_name] = (acc[event.event_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Feature usage stats
  const bookingEvents = events.filter(e => e.event_category === "booking").length;
  const favoriteEvents = events.filter(e => e.event_category === "favorite").length;
  const chatEvents = events.filter(e => e.event_category === "chat").length;
  const searchEvents = events.filter(e => e.event_category === "search").length;

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile": return Smartphone;
      case "tablet": return Tablet;
      default: return Monitor;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg font-bold">تحليلات الاستخدام</h2>
        <div className="flex gap-2">
          <Button
            variant={dateRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("7d")}
            className={dateRange === "7d" ? "gold-gradient" : ""}
          >
            7 أيام
          </Button>
          <Button
            variant={dateRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("30d")}
            className={dateRange === "30d" ? "gold-gradient" : ""}
          >
            30 يوم
          </Button>
          <Button
            variant={dateRange === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("90d")}
            className={dateRange === "90d" ? "gold-gradient" : ""}
          >
            90 يوم
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-luxe">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">إجمالي الأحداث</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">{uniqueUsers}</p>
                <p className="text-xs text-muted-foreground">مستخدم نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <MousePointer className="w-8 h-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">{uniqueSessions}</p>
                <p className="text-xs text-muted-foreground">جلسة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {Math.round(totalEvents / (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90))}
                </p>
                <p className="text-xs text-muted-foreground">حدث/يوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-luxe bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-6 h-6 text-primary" />
              <div className="text-right flex-1">
                <p className="text-xl font-bold">{bookingEvents}</p>
                <p className="text-xs text-muted-foreground">حجز</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div className="text-right flex-1">
                <p className="text-xl font-bold">{favoriteEvents}</p>
                <p className="text-xs text-muted-foreground">مفضلة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <div className="text-right flex-1">
                <p className="text-xl font-bold">{chatEvents}</p>
                <p className="text-xs text-muted-foreground">محادثة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxe bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              <div className="text-right flex-1">
                <p className="text-xl font-bold">{searchEvents}</p>
                <p className="text-xs text-muted-foreground">بحث</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
          <TabsTrigger value="events">الأحداث</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Daily Activity Chart */}
          <Card className="card-luxe">
            <CardHeader>
              <CardTitle className="text-right font-arabic">النشاط اليومي</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ textAlign: "right", direction: "rtl" }}
                    labelStyle={{ marginBottom: 8 }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#C9902B" 
                    strokeWidth={2}
                    name="الأحداث"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8B6914" 
                    strokeWidth={2}
                    name="المستخدمين"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="card-luxe">
              <CardHeader>
                <CardTitle className="text-right font-arabic">توزيع الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nameAr, percent }) => `${nameAr} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card className="card-luxe">
              <CardHeader>
                <CardTitle className="text-right font-arabic">أنواع الأجهزة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceBreakdown.map((device) => {
                    const Icon = getDeviceIcon(device.name);
                    const percentage = Math.round((device.value / totalEvents) * 100);
                    return (
                      <div key={device.name} className="flex items-center gap-4">
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                            <span className="text-sm font-medium capitalize">{device.name}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <Card className="card-luxe">
            <CardHeader>
              <CardTitle className="text-right font-arabic">أكثر الصفحات زيارة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="page" type="category" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C9902B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="card-luxe">
            <CardHeader>
              <CardTitle className="text-right font-arabic">أكثر الأحداث تكراراً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topEvents.map((event, index) => (
                  <div key={event.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{event.count.toLocaleString()}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{event.name}</span>
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
