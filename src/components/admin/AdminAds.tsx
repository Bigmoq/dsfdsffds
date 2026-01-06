import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff, Megaphone, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  click_count: number | null;
  created_at: string;
}

export function AdminAds() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteAd, setDeleteAd] = useState<Advertisement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [newAd, setNewAd] = useState({
    title: "",
    image_url: "",
    link_url: "",
    position: "home",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحميل الإعلانات", variant: "destructive" });
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.image_url) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setProcessing(true);

    const { error } = await supabase
      .from("advertisements")
      .insert({
        title: newAd.title,
        image_url: newAd.image_url,
        link_url: newAd.link_url || null,
        position: newAd.position,
      });

    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الإعلان", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تمت إضافة الإعلان بنجاح" });
      setNewAd({ title: "", image_url: "", link_url: "", position: "home" });
      setShowAddDialog(false);
      fetchAds();
    }
    setProcessing(false);
  };

  const handleToggleActive = async (ad: Advertisement) => {
    const { error } = await supabase
      .from("advertisements")
      .update({ is_active: !ad.is_active })
      .eq("id", ad.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: ad.is_active ? "تم إخفاء الإعلان" : "تم تفعيل الإعلان" });
      fetchAds();
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteAd) return;
    setProcessing(true);

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", deleteAd.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الإعلان", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الإعلان" });
      fetchAds();
    }
    setDeleteAd(null);
    setProcessing(false);
  };

  const getPositionLabel = (position: string | null) => {
    switch (position) {
      case "home": return "الرئيسية";
      case "services": return "الخدمات";
      case "halls": return "القاعات";
      case "dresses": return "الفساتين";
      default: return position;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setShowAddDialog(true)} className="gold-gradient">
          <Plus className="w-4 h-4 ml-2" />
          <span className="font-arabic">إضافة إعلان</span>
        </Button>
        <p className="text-sm text-muted-foreground text-right font-arabic">
          إجمالي: {ads.length} إعلان
        </p>
      </div>

      {ads.length === 0 ? (
        <Card className="card-luxe">
          <CardContent className="py-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-arabic">لا توجد إعلانات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <Card key={ad.id} className="card-luxe">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(ad)}
                    >
                      {ad.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteAd(ad)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-medium font-arabic">{ad.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={ad.is_active ? "default" : "secondary"} className="text-xs">
                          {ad.is_active ? "مفعّل" : "مخفي"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getPositionLabel(ad.position)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ad.click_count || 0} نقرة
                        </Badge>
                      </div>
                    </div>
                    <div className="w-16 h-10 rounded-lg bg-muted overflow-hidden">
                      {ad.image_url ? (
                        <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Ad Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>العنوان *</Label>
              <Input
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                placeholder="عنوان الإعلان"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة *</Label>
              <Input
                value={newAd.image_url}
                onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الإعلان (اختياري)</Label>
              <Input
                value={newAd.link_url}
                onChange={(e) => setNewAd({ ...newAd, link_url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Select value={newAd.position} onValueChange={(v) => setNewAd({ ...newAd, position: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">الصفحة الرئيسية</SelectItem>
                  <SelectItem value="services">صفحة الخدمات</SelectItem>
                  <SelectItem value="halls">صفحة القاعات</SelectItem>
                  <SelectItem value="dresses">صفحة الفساتين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAddAd} disabled={processing} className="gold-gradient">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteAd} onOpenChange={() => setDeleteAd(null)}>
        <DialogContent className="font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الإعلان "{deleteAd?.title}"؟
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteAd(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteAd} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
