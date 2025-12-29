import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  
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

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("يجب أن تكون الملفات صور فقط");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("service-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remainingSlots = 10 - portfolioImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "تنبيه",
        description: "الحد الأقصى 10 صور للمعرض",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      setPortfolioImages((prev) => [...prev, ...validUrls]);

      toast({
        title: "تم الرفع",
        description: `تم رفع ${validUrls.length} صورة بنجاح`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الرفع",
        description: error.message || "حدث خطأ أثناء رفع الصور",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = portfolioImages[index];

    if (urlToRemove?.includes("service-images")) {
      try {
        const path = urlToRemove.split("service-images/")[1];
        if (path) {
          await supabase.storage.from("service-images").remove([path]);
        }
      } catch (error) {
        console.log("Could not delete from storage:", error);
      }
    }

    setPortfolioImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      name_en: "",
      category_id: "",
      city: "",
      phone: "",
      description: "",
      whatsapp_enabled: true,
    });
    setPortfolioImages([]);
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
        portfolio_images: portfolioImages.length > 0 ? portfolioImages : null,
      });
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة!",
        description: "تم إضافة الخدمة بنجاح",
      });
      
      onSuccess();
      onOpenChange(false);
      resetForm();
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
          {/* Portfolio Images Upload */}
          <div className="space-y-2">
            <Label className="font-arabic">معرض الأعمال (حتى 10 صور)</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {portfolioImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
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
              {portfolioImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-arabic">رفع</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              ارفع صور من أعمالك السابقة (الحد الأقصى 5 ميجابايت لكل صورة)
            </p>
          </div>

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
            disabled={loading || !formData.name_ar || !formData.city || !formData.category_id || isUploading}
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
