import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { saudiCities } from "@/data/weddingData";

interface AddHallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddHallSheet({ open, onOpenChange, onSuccess }: AddHallSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    city: "",
    address: "",
    description: "",
    capacity_men: "",
    capacity_women: "",
    price_weekday: "",
    price_weekend: "",
    cover_image: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from("halls").insert({
        owner_id: user.id,
        name_ar: formData.name_ar,
        name_en: formData.name_en || null,
        city: formData.city,
        address: formData.address || null,
        description: formData.description || null,
        capacity_men: parseInt(formData.capacity_men) || 0,
        capacity_women: parseInt(formData.capacity_women) || 0,
        price_weekday: parseInt(formData.price_weekday) || 0,
        price_weekend: parseInt(formData.price_weekend) || 0,
        cover_image: formData.cover_image || null,
      });
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة!",
        description: "تم إضافة القاعة بنجاح",
      });
      
      onSuccess();
      onOpenChange(false);
      setFormData({
        name_ar: "",
        name_en: "",
        city: "",
        address: "",
        description: "",
        capacity_men: "",
        capacity_women: "",
        price_weekday: "",
        price_weekend: "",
        cover_image: "",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة القاعة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right mb-6">
          <SheetTitle className="font-display text-2xl">إضافة قاعة جديدة</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">الاسم بالإنجليزية</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                placeholder="Hall Name"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">الاسم بالعربية *</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => handleChange("name_ar", e.target.value)}
                placeholder="اسم القاعة"
                className="text-right font-arabic"
                required
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">المدينة *</Label>
            <Select value={formData.city} onValueChange={(v) => handleChange("city", v)}>
              <SelectTrigger className="text-right font-arabic">
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {saudiCities.map((city) => (
                  <SelectItem key={city} value={city} className="font-arabic">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">العنوان</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="العنوان التفصيلي"
              className="text-right font-arabic"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">وصف القاعة</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="اكتب وصفاً مفصلاً عن القاعة ومميزاتها"
              className="text-right font-arabic min-h-[100px]"
              dir="rtl"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">سعة النساء *</Label>
              <Input
                type="number"
                value={formData.capacity_women}
                onChange={(e) => handleChange("capacity_women", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">سعة الرجال *</Label>
              <Input
                type="number"
                value={formData.capacity_men}
                onChange={(e) => handleChange("capacity_men", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">سعر نهاية الأسبوع (ر.س) *</Label>
              <Input
                type="number"
                value={formData.price_weekend}
                onChange={(e) => handleChange("price_weekend", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">سعر أيام الأسبوع (ر.س) *</Label>
              <Input
                type="number"
                value={formData.price_weekday}
                onChange={(e) => handleChange("price_weekday", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">رابط صورة الغلاف</Label>
            <Input
              value={formData.cover_image}
              onChange={(e) => handleChange("cover_image", e.target.value)}
              placeholder="https://..."
              dir="ltr"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading || !formData.name_ar || !formData.city}
            className="w-full gold-gradient text-white py-6"
          >
            <span className="font-arabic text-lg">
              {loading ? "جارٍ الإضافة..." : "إضافة القاعة"}
            </span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
