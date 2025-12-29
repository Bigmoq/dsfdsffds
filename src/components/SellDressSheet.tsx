import { useState } from "react";
import { X, Upload, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SellDressSheetProps {
  open: boolean;
  onClose: () => void;
}

const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الخبر"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function SellDressSheet({ open, onClose }: SellDressSheetProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    size: "",
    city: "",
    phone: "",
    description: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إضافة الإعلان بنجاح! ✨",
      description: "سيتم مراجعة إعلانك ونشره قريباً",
    });
    onClose();
    setFormData({ title: "", price: "", size: "", city: "", phone: "", description: "" });
    setImages([]);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="text-right pb-4 border-b border-border">
            <SheetTitle className="font-arabic text-xl">بيع فستانك</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="font-arabic">صور الفستان (حتى 5 صور)</Label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="font-arabic">عنوان الإعلان</Label>
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
                <Label className="font-arabic">السعر (ر.س)</Label>
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
                <Label className="font-arabic">المقاس</Label>
                <Select
                  value={formData.size}
                  onValueChange={(v) => setFormData({ ...formData, size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختاري" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label className="font-arabic">المدينة</Label>
              <Select
                value={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختاري المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="font-arabic">رقم الواتساب</Label>
              <Input
                type="tel"
                placeholder="966XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="text-left"
                dir="ltr"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-arabic">الوصف</Label>
              <Textarea
                placeholder="اكتبي وصفاً مفصلاً للفستان..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-right min-h-[100px]"
                required
              />
            </div>
          </form>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-6 text-lg font-arabic bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Upload className="w-5 h-5 ml-2" />
              نشر الإعلان
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
