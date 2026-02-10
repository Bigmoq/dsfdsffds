import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Scissors, ShoppingBag, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

type AppRole = "user" | "hall_owner" | "service_provider" | "dress_seller";

interface RoleOption {
  id: AppRole;
  icon: typeof User;
  title: string;
  description: string;
  color: string;
}

const mainRoles: RoleOption[] = [
  {
    id: "user",
    icon: User,
    title: "عروس / عريس أو زائر",
    description: "أبحث عن قاعات وخدمات لحفل زفافي",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "hall_owner",
    icon: Building2,
    title: "تاجر أو مقدم خدمة",
    description: "أريد عرض خدماتي وإدارة حجوزاتي",
    color: "from-amber-400 to-yellow-500",
  },
];

const vendorRoles: RoleOption[] = [
  {
    id: "hall_owner",
    icon: Building2,
    title: "صاحب قاعة أفراح",
    description: "أملك قاعة وأريد عرضها للحجز",
    color: "from-emerald-400 to-green-500",
  },
  {
    id: "service_provider",
    icon: Scissors,
    title: "مقدم خدمة زفاف",
    description: "تصوير، مكياج، كوش، وغيرها",
    color: "from-purple-400 to-violet-500",
  },
  {
    id: "dress_seller",
    icon: ShoppingBag,
    title: "بائع فساتين",
    description: "أبيع أو أؤجر فساتين الزفاف",
    color: "from-pink-400 to-rose-500",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"main" | "vendor">("main");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/welcome", { replace: true });
        return;
      }
      checkOnboardingStatus();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      // Check if user has a role already
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);
      
      if (roles && roles.length > 0) {
        // User already has a role, redirect based on it
        redirectBasedOnRole(roles[0].role as AppRole);
        return;
      }
      
      // Check profile onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.onboarding_completed) {
        navigate("/", { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const redirectBasedOnRole = (role: AppRole) => {
    switch (role) {
      case "hall_owner":
      case "service_provider":
      case "dress_seller":
        navigate("/", { replace: true }); // They'll see vendor dashboard in profile
        break;
      default:
        navigate("/", { replace: true });
    }
  };

  const handleMainRoleSelect = (role: AppRole) => {
    if (role === "user") {
      setSelectedRole("user");
    } else {
      setStep("vendor");
    }
  };

  const handleVendorRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = async () => {
    if (!user || !selectedRole) return;
    
    setLoading(true);
    
    try {
      if (selectedRole === "user") {
        // Assign base 'user' role via secure RPC
        const { error: roleError } = await supabase
          .rpc('assign_initial_user_role', { p_user_id: user.id });
        
        if (roleError) throw roleError;
        
        // Update profile onboarding status
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
        
        if (profileError) throw profileError;
      } else {
        // For vendor roles, call the RPC that assigns the role + marks onboarding complete
        const { error: rpcError } = await supabase
          .rpc('update_user_role_after_onboarding', { user_role: selectedRole });
        
        if (rpcError) throw rpcError;

        // Auto-create vendor application with pending status
        const roleLabels: Record<string, string> = {
          hall_owner: "صاحب قاعة",
          service_provider: "مقدم خدمة",
          dress_seller: "بائع فساتين",
        };
        
        const { error: appError } = await supabase
          .from("vendor_applications")
          .insert({
            user_id: user.id,
            role: selectedRole as "hall_owner" | "service_provider" | "dress_seller",
            business_name: user.user_metadata?.full_name || roleLabels[selectedRole] || "بائع جديد",
            business_description: `طلب انضمام تلقائي كـ ${roleLabels[selectedRole]}`,
            status: "pending",
          });
        
        if (appError) {
          console.error("Error creating vendor application:", appError);
        }
      }
      
      toast({
        title: "مرحباً بك!",
        description: selectedRole === "user" 
          ? "استمتع بتصفح أفضل قاعات الأفراح"
          : "تم إنشاء حسابك بنجاح كمقدم خدمة",
      });
      
      redirectBasedOnRole(selectedRole);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>اختر نوع حسابك | زفاف</title>
      </Helmet>
      
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <div className="gold-gradient px-6 pt-16 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          {step === "vendor" && (
            <button
              onClick={() => {
                setStep("main");
                setSelectedRole(null);
              }}
              className="absolute top-6 left-6 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-3">
              {step === "main" ? "كيف تود استخدام التطبيق؟" : "ماذا تقدم؟"}
            </h1>
            <p className="text-white/80 font-arabic text-base">
              {step === "main" 
                ? "اختر ما يناسبك لتخصيص تجربتك"
                : "اختر نوع الخدمة التي تقدمها"}
            </p>
          </motion.div>
        </div>
        
        {/* Role Selection */}
        <div className="px-6 -mt-10 relative z-20 pb-32">
          <AnimatePresence mode="wait">
            {step === "main" ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {mainRoles.map((role, index) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleMainRoleSelect(role.id)}
                      className={`w-full card-luxe rounded-2xl p-6 text-right transition-all ${
                        isSelected ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold text-foreground mb-1">
                            {role.title}
                          </h3>
                          <p className="text-muted-foreground font-arabic text-sm">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="vendor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {vendorRoles.map((role, index) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleVendorRoleSelect(role.id)}
                      className={`w-full card-luxe rounded-2xl p-6 text-right transition-all ${
                        isSelected ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold text-foreground mb-1">
                            {role.title}
                          </h3>
                          <p className="text-muted-foreground font-arabic text-sm">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Confirm Button */}
        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
            >
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-6 gold-gradient text-white text-lg font-arabic shadow-xl"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "متابعة"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
