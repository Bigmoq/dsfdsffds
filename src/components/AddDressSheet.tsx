import { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Dress = Database["public"]["Tables"]["dresses"]["Row"];

interface AddDressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDress?: Dress | null;
  onSuccess: () => void;
}

const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الخبر"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const conditions = [
  { value: "new", label: "جديد بالكرتون" },
  { value: "like_new", label: "شبه جديد" },
  { value: "used", label: "مستخدم" },
];

export function AddDressSheet({ open, onOpenChange, editingDress, onSuccess }: AddDressSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    size: "",
    city: "",
    condition: "used",
    description: "",
    whatsapp_enabled: true,
  });

  useEffect(() => {
    if (editingDress) {
      setFormData({
        title: editingDress.title,
        price: editingDress.price.toString(),
        size: editingDress.size,
        city: editingDress.city,
        condition: editingDress.condition || "used",
        description: editingDress.description || "",
        whatsapp_enabled: editingDress.whatsapp_enabled ?? true,
      });
      setImageUrls(editingDress.images || []);
    } else {
      resetForm();
    }
  }, [editingDress, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      size: "",
      city: "",
      condition: "used",
      description: "",
      whatsapp_enabled: true,
    });
    setImageUrls([]);
  };

  const handleAddImageUrl = () => {
    if (imageUrls.length < 5) {
      const url = prompt("أدخلي رابط صورة الفستان:");
      if (url && url.trim()) {
        setImageUrls(prev => [...prev, url.trim()]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.price || !formData.size || !formData.city) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dressData = {
        title: formData.title,
        price: parseInt(formData.price),
        size: formData.size,
        city: formData.city,
        condition: formData.condition,
        description: formData.description,
        whatsapp_enabled: formData.whatsapp_enabled,
        images: imageUrls.length > 0 ? imageUrls : null,
        seller_id: user.id,
      };

      if (editingDress) {
        const { error } = await supabase
          .from("dresses")
          .update(dressData)
          .eq("id", editingDress.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الفستان بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("dresses")
          .insert(dressData);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم نشر إعلان الفستان بنجاح",
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-hidden" dir="rtl">
        <div className="flex flex-col h-full">
          <SheetHeader className="text-right pb-4 border-b border-border">
            <SheetTitle className="font-arabic text-xl">
              {editingDress ? "تعديل الفستان" : "إضافة فستان جديد"}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Image URLs */}
            <div className="space-y-2">
              <Label className="font-arabic">صور الفستان (حتى 5 صور)</Label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Error";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">أضيفي روابط صور الفستان</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="font-arabic">عنوان الإعلان *</Label>
              <Input
                placeholder="مثال: فستان زفاف فاخر من دار الأزياء"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-right"
                required
              />
            </div>

            {/* Price & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic">السعر (ر.س) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="text-right"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">المقاس *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(v) => setFormData({ ...formData, size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختاري" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic">المدينة *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختاري" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">الحالة</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) => setFormData({ ...formData, condition: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختاري" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-arabic">الوصف</Label>
              <Textarea
                placeholder="اكتبي وصفاً مفصلاً للفستان..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-right min-h-[100px]"
              />
            </div>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
              <Switch
                checked={formData.whatsapp_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_enabled: checked })}
              />
              <div className="text-right">
                <Label className="font-arabic">التواصل عبر واتساب</Label>
                <p className="text-xs text-muted-foreground">السماح للمشترين بالتواصل معك عبر واتساب</p>
              </div>
            </div>
          </form>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-6 text-lg font-arabic gold-gradient text-white rounded-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                editingDress ? "حفظ التغييرات" : "نشر الإعلان"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
