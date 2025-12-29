import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/onboarding", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>مرحباً بك | زفاف</title>
        <meta name="description" content="منصة زفاف - اكتشف أفضل قاعات الأفراح وخدمات الزفاف في المملكة العربية السعودية" />
      </Helmet>
      
      <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
        {/* Background Pattern */}
        <div className="absolute inset-0 gold-gradient opacity-5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNiODg2MGIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00em0wLTEwYzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
          {/* Logo & Branding */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gold-gradient flex items-center justify-center shadow-2xl">
              <Crown className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="font-display text-5xl font-bold gold-text-gradient mb-4">
              زفـــاف
            </h1>
            
            <p className="text-muted-foreground font-arabic text-lg max-w-sm mx-auto">
              منصتك الأولى لحجز قاعات الأفراح وخدمات الزفاف في المملكة
            </p>
          </motion.div>
          
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-6 mb-12 text-sm text-muted-foreground font-arabic"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>أفضل القاعات</span>
            </div>
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>خدمات متميزة</span>
            </div>
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>فساتين أنيقة</span>
            </div>
          </motion.div>
          
          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full max-w-sm space-y-4"
          >
            <Button
              onClick={() => navigate("/auth")}
              className="w-full py-6 gold-gradient text-white text-lg font-arabic shadow-xl hover:opacity-90 transition-opacity"
            >
              تسجيل الدخول أو إنشاء حساب
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-arabic">
                  أو
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full py-6 text-lg font-arabic border-2 hover:bg-muted/50"
            >
              تصفح كزائر
            </Button>
          </motion.div>
          
          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 text-center text-sm text-muted-foreground font-arabic"
          >
            بتسجيلك، أنت توافق على{" "}
            <button className="text-primary hover:underline">شروط الاستخدام</button>
            {" "}و{" "}
            <button className="text-primary hover:underline">سياسة الخصوصية</button>
          </motion.p>
        </div>
      </div>
    </>
  );
}
