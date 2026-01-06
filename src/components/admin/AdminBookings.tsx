import { useState, useEffect } from "react";
import { Loader2, Search, Calendar, Building2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HallBooking {
  id: string;
  booking_date: string;
  status: string | null;
  total_price: number | null;
  hall_id: string;
  user_id: string;
  created_at: string | null;
  hall_name?: string;
  user_name?: string;
}

interface ServiceBooking {
  id: string;
  booking_date: string;
  status: string;
  total_price: number;
  provider_id: string;
  user_id: string;
  created_at: string;
  provider_name?: string;
  user_name?: string;
}

export function AdminBookings() {
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    
    // Fetch hall bookings
    const { data: hallData } = await supabase
      .from("hall_bookings")
      .select("*")
      .order("booking_date", { ascending: false });

    // Fetch service bookings
    const { data: serviceData } = await supabase
      .from("service_bookings")
      .select("*")
      .order("booking_date", { ascending: false });

    // Fetch halls and providers for names
    const hallIds = [...new Set(hallData?.map(b => b.hall_id) || [])];
    const providerIds = [...new Set(serviceData?.map(b => b.provider_id) || [])];
    const userIds = [...new Set([
      ...(hallData?.map(b => b.user_id) || []),
      ...(serviceData?.map(b => b.user_id) || [])
    ])];

    const [{ data: halls }, { data: providers }, { data: profiles }] = await Promise.all([
      supabase.from("halls").select("id, name_ar").in("id", hallIds),
      supabase.from("service_providers").select("id, name_ar").in("id", providerIds),
      supabase.from("profiles").select("id, full_name").in("id", userIds),
    ]);

    const hallMap = new Map(halls?.map(h => [h.id, h.name_ar]) || []);
    const providerMap = new Map(providers?.map(p => [p.id, p.name_ar]) || []);
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    setHallBookings((hallData || []).map(b => ({
      ...b,
      hall_name: hallMap.get(b.hall_id) || "غير معروف",
      user_name: profileMap.get(b.user_id) || "غير معروف",
    })));

    setServiceBookings((serviceData || []).map(b => ({
      ...b,
      provider_name: providerMap.get(b.provider_id) || "غير معروف",
      user_name: profileMap.get(b.user_id) || "غير معروف",
    })));

    setLoading(false);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">قيد الانتظار</Badge>;
      case "confirmed":
      case "accepted": return <Badge className="bg-green-500">مؤكد</Badge>;
      case "cancelled":
      case "rejected": return <Badge variant="destructive">ملغي</Badge>;
      case "completed": return <Badge className="bg-blue-500">مكتمل</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredHallBookings = hallBookings.filter(b =>
    b.hall_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredServiceBookings = serviceBookings.filter(b =>
    b.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right font-arabic"
          />
        </div>
      </div>

      <Tabs defaultValue="halls" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="halls" className="font-arabic">
            <Building2 className="w-4 h-4 ml-2" />
            القاعات ({filteredHallBookings.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="font-arabic">
            <Package className="w-4 h-4 ml-2" />
            الخدمات ({filteredServiceBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-3 mt-4">
          {filteredHallBookings.map((booking) => (
            <Card key={booking.id} className="card-luxe">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    {getStatusBadge(booking.status)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.total_price?.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium font-arabic">{booking.hall_name}</p>
                    <p className="text-sm text-muted-foreground font-arabic">{booking.user_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.booking_date).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="services" className="space-y-3 mt-4">
          {filteredServiceBookings.map((booking) => (
            <Card key={booking.id} className="card-luxe">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    {getStatusBadge(booking.status)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.total_price?.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium font-arabic">{booking.provider_name}</p>
                    <p className="text-sm text-muted-foreground font-arabic">{booking.user_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.booking_date).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
