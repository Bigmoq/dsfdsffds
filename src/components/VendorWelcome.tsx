import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Calendar, 
  BarChart3, 
  Bell, 
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Users,
  Camera,
  Star,
  ShoppingBag,
  Tag,
  MessageCircle
} from "lucide-react";

type VendorType = "hall_owner" | "service_provider" | "dress_seller";

interface VendorWelcomeProps {
  onComplete: () => void;
  vendorType: VendorType;
}

const featuresByType = {
  hall_owner: {
    welcomeMessage: "أنت الآن مقدم قاعات معتمد",
    features: [
      {
        icon: Building2,
        title: "إدارة القاعات",
        description: "أضف قاعاتك بسهولة مع الصور والتفاصيل والأسعار"
      },
      {
        icon: Calendar,
        title: "تقويم الحجوزات",
        description: "تحكم في التواريخ المتاحة وإدارة الحجوزات"
      },
      {
        icon: BarChart3,
        title: "تحليلات متقدمة",
        description: "تابع أداء قاعاتك والإيرادات والاتجاهات"
      },
      {
        icon: Bell,
        title: "إشعارات فورية",
        description: "احصل على تنبيهات عند وصول حجوزات جديدة"
      }
    ]
  },
  service_provider: {
    welcomeMessage: "أنت الآن مقدم خدمات معتمد",
    features: [
      {
        icon: Users,
        title: "إدارة الخدمات",
        description: "أضف خدماتك وباقاتك مع الأسعار والتفاصيل"
      },
      {
        icon: Camera,
        title: "معرض الأعمال",
        description: "اعرض أعمالك السابقة لجذب المزيد من العملاء"
      },
      {
        icon: Calendar,
        title: "تقويم المواعيد",
        description: "تحكم في أيام العمل وإدارة الحجوزات"
      },
      {
        icon: Star,
        title: "التقييمات والمراجعات",
        description: "احصل على تقييمات العملاء لبناء سمعتك"
      }
    ]
  },
  dress_seller: {
    welcomeMessage: "أنت الآن بائع فساتين معتمد",
    features: [
      {
        icon: ShoppingBag,
        title: "إدارة الفساتين",
        description: "أضف فساتينك مع الصور والمقاسات والأسعار"
      },
      {
        icon: Tag,
        title: "تحديد الأسعار",
        description: "تحكم في أسعار فساتينك وحالتها"
      },
      {
        icon: MessageCircle,
        title: "التواصل المباشر",
        description: "تواصل مع المشترين عبر واتساب"
      },
      {
        icon: Bell,
        title: "إشعارات فورية",
        description: "احصل على تنبيهات عند اهتمام المشترين"
      }
    ]
  }
};

export const VendorWelcome = ({ onComplete, vendorType }: VendorWelcomeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { welcomeMessage, features } = featuresByType[vendorType];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          تخطي
        </Button>
        <div className="flex gap-1.5">
          {features.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                    ? "w-1.5 bg-primary/50" 
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {currentStep === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                  مرحباً بك! 🎉
                </h1>
                <p className="text-muted-foreground font-arabic text-lg">
                  {welcomeMessage}
                </p>
              </motion.div>
            )}

            <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mb-6">
              {(() => {
                const IconComponent = features[currentStep].icon;
                return <IconComponent className="w-10 h-10 text-white" />;
              })()}
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              {features[currentStep].title}
            </h2>
            
            <p className="text-muted-foreground font-arabic text-base leading-relaxed">
              {features[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 pb-8">
        <Button
          onClick={handleNext}
          className="w-full gold-gradient text-white py-6 rounded-xl text-lg font-bold"
        >
          {currentStep < features.length - 1 ? (
            <span className="flex items-center gap-2">
              التالي
              <ArrowLeft className="w-5 h-5" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              ابدأ الآن
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
