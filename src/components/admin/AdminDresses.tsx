import { useState, useEffect } from "react";
import { Loader2, Search, Trash2, Eye, EyeOff, ShoppingBag } from "lucide-react";
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

type Dress = Database["public"]["Tables"]["dresses"]["Row"];

export function AdminDresses() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDress, setDeleteDress] = useState<Dress | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDresses();
  }, []);

  const fetchDresses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dresses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل الفساتين", variant: "destructive" });
    } else {
      setDresses(data || []);
    }
    setLoading(false);
  };

  const handleToggleActive = async (dress: Dress) => {
    const { error } = await supabase
      .from("dresses")
      .update({ is_active: !dress.is_active })
      .eq("id", dress.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: dress.is_active ? "تم إخفاء الفستان" : "تم تفعيل الفستان" });
      fetchDresses();
    }
  };

  const handleDeleteDress = async () => {
    if (!deleteDress) return;
    setProcessing(true);

    const { error } = await supabase
      .from("dresses")
      .delete()
      .eq("id", deleteDress.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الفستان", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الفستان" });
      fetchDresses();
    }
    setDeleteDress(null);
    setProcessing(false);
  };

  const filteredDresses = dresses.filter(d => 
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="بحث بالعنوان أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right font-arabic"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right font-arabic">
        إجمالي: {filteredDresses.length} فستان
      </p>

      <div className="space-y-3">
        {filteredDresses.map((dress) => (
          <Card key={dress.id} className="card-luxe">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(dress)}
                  >
                    {dress.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteDress(dress)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="font-medium font-arabic">{dress.title}</p>
                    <p className="text-sm text-muted-foreground">{dress.city}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={dress.is_active ? "default" : "secondary"} className="text-xs">
                        {dress.is_active ? "مفعّل" : "مخفي"}
                      </Badge>
                      <Badge variant={dress.is_sold ? "destructive" : "outline"} className="text-xs">
                        {dress.is_sold ? "مباع" : `${dress.price} ر.س`}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                    {dress.images?.[0] ? (
                      <img src={dress.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
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
      <Dialog open={!!deleteDress} onOpenChange={() => setDeleteDress(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الفستان "{deleteDress?.title}"؟
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDress(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteDress} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
