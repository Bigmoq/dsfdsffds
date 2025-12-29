import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Scissors, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type VendorRole = Database["public"]["Enums"]["vendor_role"];

interface VendorApplicationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const vendorTypes: { role: VendorRole; icon: typeof Building2; label: string; description: string }[] = [
  {
    role: "hall_owner",
    icon: Building2,
    label: "صاحب قاعة",
    description: "أضف قاعتك وأدر الحجوزات والتواريخ",
  },
  {
    role: "service_provider",
    icon: Scissors,
    label: "مقدم خدمة",
    description: "قدم خدماتك للعرائس والعرسان",
  },
  {
    role: "dress_seller",
    icon: ShoppingBag,
    label: "بائع فساتين",
    description: "اعرض فساتينك للبيع أو الإيجار",
  },
];

export function VendorApplicationSheet({ open, onOpenChange }: VendorApplicationSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<VendorRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRoleSelect = (role: VendorRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedRole) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from("vendor_applications").insert({
        user_id: user.id,
        role: selectedRole,
        business_name: businessName,
        business_description: businessDescription,
      });
      
      if (error) {
        if (error.code === "23505") {
          toast({
            title: "طلب موجود",
            description: "لديك طلب انضمام قيد المراجعة بالفعل",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      
      setSubmitted(true);
      toast({
        title: "تم إرسال الطلب!",
        description: "سنراجع طلبك ونتواصل معك قريباً",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedRole(null);
      setBusinessName("");
      setBusinessDescription("");
      setSubmitted(false);
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl" dir="rtl">
        <SheetHeader className="text-right mb-6">
          <SheetTitle className="font-display text-2xl">
            {submitted ? "تم إرسال الطلب" : step === 1 ? "انضم كمقدم خدمة" : "معلومات العمل"}
          </SheetTitle>
        </SheetHeader>
        
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                شكراً لك!
              </h3>
              <p className="text-muted-foreground font-arabic mb-6">
                سنراجع طلبك ونتواصل معك خلال 24-48 ساعة
              </p>
              <Button onClick={handleClose} className="gold-gradient text-white">
                <span className="font-arabic">إغلاق</span>
              </Button>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground font-arabic text-sm mb-6">
                اختر نوع الخدمة التي تريد تقديمها
              </p>
              
              {vendorTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.role}
                    onClick={() => handleRoleSelect(type.role)}
                    className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
                  >
                    <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {type.label}
                      </h3>
                      <p className="text-muted-foreground font-arabic text-sm">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                <span className="font-arabic text-sm">رجوع</span>
              </button>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-arabic">اسم النشاط التجاري</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="أدخل اسم نشاطك التجاري"
                    className="text-right font-arabic"
                    required
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-arabic">وصف النشاط</Label>
                  <Textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="اكتب وصفاً مختصراً عن نشاطك وخدماتك"
                    className="text-right font-arabic min-h-[120px]"
                    dir="rtl"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading || !businessName}
                  className="w-full gold-gradient text-white py-6"
                >
                  <span className="font-arabic text-lg">
                    {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
                  </span>
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
