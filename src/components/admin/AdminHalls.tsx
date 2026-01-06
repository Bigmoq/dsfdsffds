import { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Eye, EyeOff, Building2 } from "lucide-react";
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

type Hall = Database["public"]["Tables"]["halls"]["Row"];

export function AdminHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteHall, setDeleteHall] = useState<Hall | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("halls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل القاعات", variant: "destructive" });
    } else {
      setHalls(data || []);
    }
    setLoading(false);
  };

  const handleToggleActive = async (hall: Hall) => {
    const { error } = await supabase
      .from("halls")
      .update({ is_active: !hall.is_active })
      .eq("id", hall.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: hall.is_active ? "تم إخفاء القاعة" : "تم تفعيل القاعة" });
      fetchHalls();
    }
  };

  const handleDeleteHall = async () => {
    if (!deleteHall) return;
    setProcessing(true);

    const { error } = await supabase
      .from("halls")
      .delete()
      .eq("id", deleteHall.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف القاعة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف القاعة" });
      fetchHalls();
    }
    setDeleteHall(null);
    setProcessing(false);
  };

  const filteredHalls = halls.filter(h => 
    h.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase())
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
        إجمالي: {filteredHalls.length} قاعة
      </p>

      <div className="space-y-3">
        {filteredHalls.map((hall) => (
          <Card key={hall.id} className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(hall)}
                  >
                    {hall.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteHall(hall)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="font-medium font-arabic">{hall.name_ar}</p>
                    <p className="text-sm text-muted-foreground">{hall.city}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={hall.is_active ? "default" : "secondary"} className="text-xs">
                        {hall.is_active ? "مفعّل" : "مخفي"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {hall.price_weekday} ر.س
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                    {hall.cover_image ? (
                      <img src={hall.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteHall} onOpenChange={() => setDeleteHall(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف قاعة "{deleteHall?.name_ar}"؟
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteHall(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteHall} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
