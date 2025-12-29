import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { ServicesScreen } from "@/components/ServicesScreen";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);

  const screens = [
    <HomeScreen key="home" />,
    <ServicesScreen key="services" />,
    <FavoritesScreen key="favorites" />,
    <ProfileScreen key="profile" />,
  ];

  return (
    <>
      <Helmet>
        <title>زفاف | Wedding Services Super-App</title>
        <meta name="description" content="اكتشف أفضل قاعات الأفراح وخدمات الزفاف في المملكة العربية السعودية. احجز قاعتك واختر مقدمي الخدمات بسهولة." />
      </Helmet>
      
      <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
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
