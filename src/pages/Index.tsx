import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { ServicesScreen } from "@/components/ServicesScreen";
import { DressesScreen } from "@/components/DressesScreen";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [activeTab, setActiveTab] = useState(2); // Default to Home (center)
  const { user } = useAuth();

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
