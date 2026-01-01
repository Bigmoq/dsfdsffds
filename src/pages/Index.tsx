import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { ServicesScreen } from "@/components/ServicesScreen";
import { DressesScreen } from "@/components/DressesScreen";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { VendorDashboard } from "@/components/VendorDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState(2); // Default to Home (center)
  const { user, isVendor, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If user is a vendor, show the vendor dashboard
  if (user && isVendor) {
    return (
      <>
        <Helmet>
          <title>لوحة التحكم | زفاف</title>
          <meta name="description" content="لوحة التحكم لمقدمي الخدمات - إدارة الحجوزات والخدمات" />
        </Helmet>
        
        <div className="min-h-screen bg-background overflow-x-hidden pb-20" dir="rtl">
          {/* Notifications Button */}
          <div className="fixed top-4 left-4 z-50">
            <NotificationsSheet />
          </div>
          
          {/* Header */}
          <div className="p-4 pt-6">
            <h1 className="font-display text-2xl font-bold text-foreground text-right">
              مرحباً بك 👋
            </h1>
            <p className="text-muted-foreground font-arabic text-sm text-right mt-1">
              إدارة خدماتك وحجوزاتك
            </p>
          </div>
          
          <VendorDashboard />
          
          {/* Bottom Nav for vendors - only Profile tab active */}
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 py-2 px-4 z-40">
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/?mode=user'}
                className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="font-arabic text-xs">تصفح كمستخدم</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Regular user view
  // Tab order: 0=Services, 1=Dresses, 2=Home, 3=Favorites, 4=Profile
  const screens: Record<number, JSX.Element> = {
    0: <ServicesScreen key="services" />,
    1: <DressesScreen key="dresses" />,
    2: <HomeScreen key="home" />,
    3: <FavoritesScreen key="favorites" />,
    4: <ProfileScreen key="profile" />,
  };

  return (
    <>
      <Helmet>
        <title>زفاف | Wedding Services Super-App</title>
        <meta name="description" content="اكتشف أفضل قاعات الأفراح وخدمات الزفاف في المملكة العربية السعودية. احجز قاعتك واختر مقدمي الخدمات بسهولة." />
      </Helmet>
      
      <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
        {/* Notifications Button - Fixed at top */}
        {user && (
          <div className="fixed top-4 left-4 z-50">
            <NotificationsSheet />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {screens[activeTab]}
          </motion.div>
        </AnimatePresence>
        
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  );
};

export default Index;
