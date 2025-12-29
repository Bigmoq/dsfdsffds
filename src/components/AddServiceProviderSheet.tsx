import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { saudiCities, womenCategories, menCategories } from "@/data/weddingData";

interface AddServiceProviderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const allCategories = [
  ...womenCategories.map(c => ({ id: c.id, label: c.nameAr, type: 'women' })),
  ...menCategories.map(c => ({ id: c.id, label: c.nameAr, type: 'men' })),
];

export function AddServiceProviderSheet({ open, onOpenChange, onSuccess }: AddServiceProviderSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    category_id: "",
    city: "",
    phone: "",
    description: "",
    whatsapp_enabled: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from("service_providers").insert({
        owner_id: user.id,
        name_ar: formData.name_ar,
        name_en: formData.name_en || null,
        category_id: formData.category_id,
        city: formData.city,
        phone: formData.phone || null,
        description: formData.description || null,
        whatsapp_enabled: formData.whatsapp_enabled,
      });
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة!",
        description: "تم إضافة الخدمة بنجاح",
      });
      
      onSuccess();
      onOpenChange(false);
      setFormData({
        name_ar: "",
        name_en: "",
        category_id: "",
        city: "",
        phone: "",
        description: "",
        whatsapp_enabled: true,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة الخدمة",
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
          <SheetTitle className="font-display text-2xl">إضافة خدمة جديدة</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">الاسم بالإنجليزية</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                placeholder="Service Name"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic">الاسم بالعربية *</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => handleChange("name_ar", e.target.value)}
                placeholder="اسم الخدمة"
                className="text-right font-arabic"
                required
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">نوع الخدمة *</Label>
            <Select value={formData.category_id} onValueChange={(v) => handleChange("category_id", v)}>
              <SelectTrigger className="text-right font-arabic">
                <SelectValue placeholder="اختر نوع الخدمة" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground font-arabic">
                  خدمات النساء
                </div>
                {allCategories.filter(c => c.type === 'women').map((category) => (
                  <SelectItem key={category.id} value={category.id} className="font-arabic">
                    {category.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground font-arabic mt-2">
                  خدمات الرجال
                </div>
                {allCategories.filter(c => c.type === 'men').map((category) => (
                  <SelectItem key={category.id} value={category.id} className="font-arabic">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label className="font-arabic">رقم الهاتف</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="966501234567"
              dir="ltr"
              type="tel"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">وصف الخدمة</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="اكتب وصفاً مفصلاً عن خدمتك ومميزاتها"
              className="text-right font-arabic min-h-[100px]"
              dir="rtl"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <Switch
              checked={formData.whatsapp_enabled}
              onCheckedChange={(checked) => handleChange("whatsapp_enabled", checked)}
            />
            <div className="text-right">
              <Label className="font-arabic">تفعيل التواصل عبر واتساب</Label>
              <p className="text-sm text-muted-foreground font-arabic">
                السماح للعملاء بالتواصل معك مباشرة
              </p>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading || !formData.name_ar || !formData.city || !formData.category_id}
            className="w-full gold-gradient text-white py-6"
          >
            <span className="font-arabic text-lg">
              {loading ? "جارٍ الإضافة..." : "إضافة الخدمة"}
            </span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
