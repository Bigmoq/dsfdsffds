import { useState } from "react";
import { X, Upload, Plus, Camera, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SellDressSheetProps {
  open: boolean;
  onClose: () => void;
}

const cities = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "الخبر"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const conditions = [
  { value: "new", label: "جديد (لم يُستخدم)", icon: "✨" },
  { value: "used", label: "مستعمل (بحالة ممتازة)", icon: "💎" },
];

type Step = 1 | 2 | 3;

export function SellDressSheet({ open, onClose }: SellDressSheetProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    size: "",
    city: "",
    condition: "",
    description: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      
      setImages((prev) => [...prev, ...newFiles].slice(0, 5));
      setImageUrls((prev) => [...prev, ...newUrls].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ title: "", price: "", size: "", city: "", condition: "", description: "" });
    setImages([]);
    setImageUrls([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep1 = () => {
    if (images.length === 0) {
      toast({
        title: "صور مطلوبة",
        description: "يرجى إضافة صورة واحدة على الأقل",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.title || !formData.price || !formData.size || !formData.city || !formData.condition) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لنشر إعلانك",
        variant: "destructive",
      });
      handleClose();
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to storage
      const uploadedUrls: string[] = [];
      
      for (const image of images) {
        const fileName = `${session.user.id}/${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from('dress-images')
          .upload(fileName, image);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('dress-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      }

      // Insert dress record
      const { error: insertError } = await supabase.from("dresses").insert({
        seller_id: session.user.id,
        title: formData.title,
        price: parseInt(formData.price),
        size: formData.size,
        city: formData.city,
        condition: formData.condition,
        description: formData.description,
        images: uploadedUrls,
        is_active: true,
        is_sold: false,
      });

      if (insertError) throw insertError;

      toast({
        title: "تم نشر إعلانك بنجاح! ✨",
        description: "يمكنك الآن رؤية إعلانك في سوق الفساتين",
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        title: "خطأ في النشر",
        description: error.message || "حدث خطأ أثناء نشر الإعلان",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = {
    1: "صور الفستان",
    2: "تفاصيل الفستان",
    3: "مراجعة ونشر",
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-hidden" dir="rtl">
        <div className="flex flex-col h-full">
          {/* Header with Steps */}
          <SheetHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <SheetTitle className="font-arabic text-xl">{stepTitles[step]}</SheetTitle>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-1 rounded-full transition-all ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Images */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-arabic text-sm">
                      أضيفي صور واضحة للفستان (حتى 5 صور)
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                            الرئيسية
                          </span>
                        )}
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Plus className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground font-arabic">إضافة</span>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="font-arabic">عنوان الإعلان *</Label>
                    <Input
                      placeholder="مثال: فستان زفاف فاخر من دار الأزياء"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-right"
                    />
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label className="font-arabic">حالة الفستان *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {conditions.map((cond) => (
                        <button
                          key={cond.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: cond.value })}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.condition === cond.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl mb-1 block">{cond.icon}</span>
                          <span className="text-sm font-arabic">{cond.label}</span>
                        </button>
                      ))}
                    </div>
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
                    <Label className="font-arabic">المدينة *</Label>
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

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="font-arabic">الوصف (اختياري)</Label>
                    <Textarea
                      placeholder="اكتبي وصفاً مفصلاً للفستان..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="text-right min-h-[80px]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-muted-foreground font-arabic text-sm">
                      راجعي بيانات إعلانك قبل النشر
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-4">
                    {/* Images Preview */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {imageUrls.map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt="" 
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                        />
                      ))}
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground">{formData.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary font-bold">{parseInt(formData.price).toLocaleString()} ر.س</span>
                        <span className="text-muted-foreground">{formData.city}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                          مقاس: {formData.size}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          formData.condition === 'new' 
                            ? "bg-emerald-500/20 text-emerald-600" 
                            : "bg-amber-500/20 text-amber-600"
                        }`}>
                          {formData.condition === 'new' ? 'جديد' : 'مستعمل'}
                        </span>
                      </div>
                      {formData.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 py-6 rounded-xl font-arabic gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                السابق
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/90 font-arabic gap-2"
              >
                التالي
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-6 rounded-xl gold-gradient text-white font-arabic gap-2"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    نشر الإعلان
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
