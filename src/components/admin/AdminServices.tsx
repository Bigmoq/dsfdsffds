import { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];

export function AdminServices() {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteService, setDeleteService] = useState<ServiceProvider | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل الخدمات", variant: "destructive" });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleToggleActive = async (service: ServiceProvider) => {
    const { error } = await supabase
      .from("service_providers")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: service.is_active ? "تم إخفاء الخدمة" : "تم تفعيل الخدمة" });
      fetchServices();
    }
  };

  const handleDeleteService = async () => {
    if (!deleteService) return;
    setProcessing(true);

    const { error } = await supabase
      .from("service_providers")
      .delete()
      .eq("id", deleteService.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الخدمة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الخدمة" });
      fetchServices();
    }
    setDeleteService(null);
    setProcessing(false);
  };

  const getCategoryLabel = (categoryId: string) => {
    const categories: Record<string, string> = {
      photography: "تصوير",
      makeup: "مكياج",
      hairstyle: "تسريحات",
      henna: "حناء",
      catering: "ضيافة",
      flowers: "زهور",
      singer: "منشد/مطرب",
      groom: "تجهيز عريس",
    };
    return categories[categoryId] || categoryId;
  };

  const filteredServices = services.filter(s => 
    s.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="بحث بالاسم أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right font-arabic"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right font-arabic">
        إجمالي: {filteredServices.length} مقدم خدمة
      </p>

      <div className="space-y-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(service)}
                  >
                    {service.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteService(service)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="font-medium font-arabic">{service.name_ar}</p>
                    <p className="text-sm text-muted-foreground">{service.city}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                        {service.is_active ? "مفعّل" : "مخفي"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(service.category_id)}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteService} onOpenChange={() => setDeleteService(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف خدمة "{deleteService?.name_ar}"؟
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteService(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteService} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
