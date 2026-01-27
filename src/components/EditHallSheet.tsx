import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Loader2, ImageIcon, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { saudiCities } from "@/data/weddingData";
import { LocationPicker } from "@/components/LocationPicker";
import { SortableFeatureList } from "@/components/SortableFeatureList";
import type { Database } from "@/integrations/supabase/types";

type Hall = Database["public"]["Tables"]["halls"]["Row"];

interface EditHallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  hall: Hall;
}

export function EditHallSheet({ open, onOpenChange, onSuccess, hall }: EditHallSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [noFeatures, setNoFeatures] = useState(false);

  const availableFeatures = [
    "مواقف سيارات",
    "قاعة VIP",
    "مسرح",
    "شاشات عرض",
    "نظام صوتي",
    "واي فاي",
    "غرف تجهيز",
    "حديقة خارجية",
    "مصلى",
    "خدمة ضيافة",
  ];
  
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    city: "",
    address: "",
    description: "",
    capacity_men: "",
    capacity_women: "",
    min_capacity_men: "",
    min_capacity_women: "",
    pricing_type: "total" as "total" | "per_chair",
    price_weekday: "",
    price_weekend: "",
    price_per_chair_weekday: "",
    price_per_chair_weekend: "",
    phone: "",
    whatsapp_enabled: true,
  });

  // Initialize form with hall data
  useEffect(() => {
    if (hall && open) {
      setFormData({
        name_ar: hall.name_ar || "",
        name_en: hall.name_en || "",
        city: hall.city || "",
        address: hall.address || "",
        description: hall.description || "",
        capacity_men: hall.capacity_men?.toString() || "",
        capacity_women: hall.capacity_women?.toString() || "",
        min_capacity_men: (hall as any).min_capacity_men?.toString() || "",
        min_capacity_women: (hall as any).min_capacity_women?.toString() || "",
        pricing_type: ((hall as any).pricing_type as "total" | "per_chair") || "total",
        price_weekday: hall.price_weekday?.toString() || "",
        price_weekend: hall.price_weekend?.toString() || "",
        price_per_chair_weekday: (hall as any).price_per_chair_weekday?.toString() || "",
        price_per_chair_weekend: (hall as any).price_per_chair_weekend?.toString() || "",
        phone: hall.phone || "",
        whatsapp_enabled: hall.whatsapp_enabled ?? true,
      });
      setCoverImage(hall.cover_image || null);
      setGalleryImages(hall.gallery_images || []);
      setLatitude(hall.latitude ? Number(hall.latitude) : null);
      setLongitude(hall.longitude ? Number(hall.longitude) : null);
      
      // Initialize features
      if (hall.features && hall.features.length > 0) {
        setSelectedFeatures(hall.features);
        setNoFeatures(false);
      } else {
        setSelectedFeatures([]);
        setNoFeatures(true);
      }
    }
  }, [hall, open]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number | null, lng: number | null) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;

    if (!file.type.startsWith("image/")) {
      throw new Error("يجب أن تكون الملفات صور فقط");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("hall-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("hall-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingCover(true);
    try {
      const url = await uploadImage(file, "covers");
      if (url) {
        setCoverImage(url);
        toast({
          title: "تم الرفع",
          description: "تم رفع صورة الغلاف بنجاح",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الرفع",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const remainingSlots = 10 - galleryImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "تنبيه",
        description: "الحد الأقصى 10 صور للمعرض",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingGallery(true);
    try {
      const uploadPromises = filesToUpload.map((file) => uploadImage(file, "gallery"));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      
      setGalleryImages((prev) => [...prev, ...validUrls]);
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
      setIsUploadingGallery(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const removeCoverImage = async () => {
    if (coverImage?.includes("hall-images")) {
      try {
        const path = coverImage.split("hall-images/")[1];
        if (path) {
          await supabase.storage.from("hall-images").remove([path]);
        }
      } catch (error) {
        console.log("Could not delete from storage:", error);
      }
    }
    setCoverImage(null);
  };

  const removeGalleryImage = async (index: number) => {
    const urlToRemove = galleryImages[index];
    if (urlToRemove?.includes("hall-images")) {
      try {
        const path = urlToRemove.split("hall-images/")[1];
        if (path) {
          await supabase.storage.from("hall-images").remove([path]);
        }
      } catch (error) {
        console.log("Could not delete from storage:", error);
      }
    }
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const updateData: any = {
        name_ar: formData.name_ar,
        name_en: formData.name_en || null,
        city: formData.city,
        address: formData.address || null,
        description: formData.description || null,
        capacity_men: parseInt(formData.capacity_men) || 0,
        capacity_women: parseInt(formData.capacity_women) || 0,
        min_capacity_men: parseInt(formData.min_capacity_men) || 0,
        min_capacity_women: parseInt(formData.min_capacity_women) || 0,
        pricing_type: formData.pricing_type,
        price_weekday: formData.pricing_type === "total" ? (parseInt(formData.price_weekday) || 0) : 0,
        price_weekend: formData.pricing_type === "total" ? (parseInt(formData.price_weekend) || 0) : 0,
        price_per_chair_weekday: formData.pricing_type === "per_chair" ? (parseInt(formData.price_per_chair_weekday) || null) : null,
        price_per_chair_weekend: formData.pricing_type === "per_chair" ? (parseInt(formData.price_per_chair_weekend) || null) : null,
        cover_image: coverImage,
        gallery_images: galleryImages.length > 0 ? galleryImages : null,
        features: noFeatures ? null : (selectedFeatures.length > 0 ? selectedFeatures : null),
        phone: formData.phone || null,
        whatsapp_enabled: formData.whatsapp_enabled,
        latitude: latitude,
        longitude: longitude,
      };

      const { error } = await supabase
        .from("halls")
        .update(updateData)
        .eq("id", hall.id);
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث!",
        description: "تم تحديث بيانات القاعة بنجاح",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث القاعة",
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
          <SheetTitle className="font-display text-2xl">تعديل القاعة</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label className="font-arabic">صورة الغلاف</Label>
            {coverImage ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors disabled:opacity-50"
              >
                {isUploadingCover ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground font-arabic">اضغط لرفع صورة الغلاف</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Gallery Images Upload */}
          <div className="space-y-2">
            <Label className="font-arabic">معرض الصور (حتى 10 صور)</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {galleryImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors disabled:opacity-50"
                >
                  {isUploadingGallery ? (
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
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              الحد الأقصى 5 ميجابايت لكل صورة
            </p>
          </div>

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

          {/* Location Picker */}
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
          
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
          
          {/* Capacity Section */}
          <div className="space-y-3">
            <Label className="font-arabic font-semibold">السعة</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic text-sm">الحد الأقصى للنساء *</Label>
                <Input
                  type="number"
                  value={formData.capacity_women}
                  onChange={(e) => handleChange("capacity_women", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic text-sm">الحد الأقصى للرجال *</Label>
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
                <Label className="font-arabic text-sm">الحد الأدنى للنساء</Label>
                <Input
                  type="number"
                  value={formData.min_capacity_women}
                  onChange={(e) => handleChange("min_capacity_women", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic text-sm">الحد الأدنى للرجال</Label>
                <Input
                  type="number"
                  value={formData.min_capacity_men}
                  onChange={(e) => handleChange("min_capacity_men", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Pricing Type Selection */}
          <div className="space-y-3">
            <Label className="font-arabic font-semibold">نوع التسعير</Label>
            <RadioGroup
              value={formData.pricing_type}
              onValueChange={(v) => handleChange("pricing_type", v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="total" id="total" />
                <Label htmlFor="total" className="font-arabic cursor-pointer">سعر إجمالي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="per_chair" id="per_chair" />
                <Label htmlFor="per_chair" className="font-arabic cursor-pointer">سعر بالكرسي</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pricing Fields */}
          {formData.pricing_type === "total" ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-arabic">سعر الكرسي نهاية الأسبوع (ر.س) *</Label>
                <Input
                  type="number"
                  value={formData.price_per_chair_weekend}
                  onChange={(e) => handleChange("price_per_chair_weekend", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-arabic">سعر الكرسي أيام الأسبوع (ر.س) *</Label>
                <Input
                  type="number"
                  value={formData.price_per_chair_weekday}
                  onChange={(e) => handleChange("price_per_chair_weekday", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          )}

          {/* Phone and WhatsApp */}
          <div className="space-y-2">
            <Label className="font-arabic flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف (واتساب)
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="966512345678"
              dir="ltr"
              className="text-left"
            />
            <p className="text-xs text-muted-foreground font-arabic">
              أدخل الرقم مع رمز الدولة (مثال: 966512345678)
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label className="font-arabic">تفعيل التواصل عبر واتساب</Label>
            <Switch
              checked={formData.whatsapp_enabled}
              onCheckedChange={(checked) => handleChange("whatsapp_enabled", checked)}
            />
          </div>

          {/* Features Section */}
          <SortableFeatureList
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
            noFeatures={noFeatures}
            setNoFeatures={setNoFeatures}
            availableFeatures={availableFeatures}
          />
          
          <Button
            type="submit"
            disabled={loading || !formData.name_ar || !formData.city || isUploadingCover || isUploadingGallery}
            className="w-full gold-gradient text-white py-6"
          >
            <span className="font-arabic text-lg">
              {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
