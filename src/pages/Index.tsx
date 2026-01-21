import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { ServicesScreen } from "@/components/ServicesScreen";
import { DressesScreen } from "@/components/DressesScreen";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { VendorDashboard } from "@/components/VendorDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { ChatFAB } from "@/components/chat/ChatFAB";

// Page transition variants
const pageVariants = {
  initial: (dir: number) => ({
    opacity: 0,
    x: dir * 60,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -60,
    scale: 0.98,
  }),
};

const pageTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(2); // Default to Home (center)
  const [initialSection, setInitialSection] = useState<string | null>(null);
  const [vendorKey, setVendorKey] = useState(0); // Key to force remount VendorDashboard
  const [showVendorDashboard, setShowVendorDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const prevTabRef = useRef(2);
  const { user, isVendor, isAdmin, loading, role } = useAuth();
  
  // Check URL params for deep linking
  const adminParam = searchParams.get("admin") === "true";
  const tabParam = searchParams.get("tab");
  const sectionParam = searchParams.get("section");

  // Handle URL-based navigation
  useEffect(() => {
    // Only process if we have URL params
    if (!tabParam && !sectionParam) {
      // Default behavior for vendors when no params
      if (isVendor && !showVendorDashboard) {
        setShowVendorDashboard(true);
      }
      return;
    }

    if (tabParam === "profile") {
      setActiveTab(4);
      if (sectionParam) {
        setInitialSection(sectionParam);
      }
    } else if (tabParam === "vendor" && (isVendor || isAdmin)) {
      // Show vendor dashboard with section
      setShowVendorDashboard(true);
      setShowAdminDashboard(false);
      if (sectionParam) {
        setInitialSection(sectionParam);
        // Force remount of VendorDashboard to pick up new section
        setVendorKey(prev => prev + 1);
      }
    } else if (tabParam === "admin" && isAdmin) {
      // Show admin dashboard with section
      setShowAdminDashboard(true);
      setShowVendorDashboard(false);
      if (sectionParam) {
        setInitialSection(sectionParam);
      }
    }
    
    // Clear URL params after processing
    setSearchParams({}, { replace: true });
  }, [tabParam, sectionParam, isVendor, isAdmin, setSearchParams, showVendorDashboard]);

  // Track tab changes for directional animations
  const handleTabChange = (newTab: number) => {
    prevTabRef.current = activeTab;
    setActiveTab(newTab);
  };

  // Determine animation direction based on tab positions (RTL layout)
  const direction = activeTab > prevTabRef.current ? -1 : 1;

  // Show loading while checking auth OR when admin param is set but role not loaded yet
  if (loading || (adminParam && user && role === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If admin dashboard is requested via URL param and user is admin
  if ((adminParam || showAdminDashboard) && isAdmin) {
    return (
      <>
        <Helmet>
          <title>لوحة الإدارة | زفاف</title>
          <meta name="description" content="لوحة إدارة التطبيق" />
        </Helmet>
        <AdminDashboard onBack={() => window.location.href = "/"} initialSection={initialSection} />
      </>
    );
  }

  // If user is a vendor, show the vendor dashboard
  if (user && (isVendor || showVendorDashboard)) {
    return (
      <>
        <Helmet>
          <title>لوحة التحكم | زفاف</title>
          <meta name="description" content="لوحة التحكم لمقدمي الخدمات - إدارة الحجوزات والخدمات" />
        </Helmet>
        
        <div className="min-h-screen bg-background overflow-x-hidden pb-20" dir="rtl">
          {/* Push Notification Permission Banner */}
          <NotificationPermissionBanner />
          
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
          
          <VendorDashboard key={vendorKey} initialSection={initialSection} />
          
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

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="will-change-transform"
          >
            {screens[activeTab]}
          </motion.div>
        </AnimatePresence>
        
        {/* Chat FAB */}
        <ChatFAB />
        
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
    </>
  );
};

export default Index;
