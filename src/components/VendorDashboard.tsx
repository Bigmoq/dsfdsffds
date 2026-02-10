import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HallManagement } from "./HallManagement";
import { ServiceProviderManagement } from "./ServiceProviderManagement";
import { DressSellerManagement } from "./DressSellerManagement";
import { VendorAnalytics } from "./VendorAnalytics";
import { ServiceBookingManagement } from "./ServiceBookingManagement";
import { HallBookingManagement } from "./HallBookingManagement";
import { BookingCalendarView } from "./BookingCalendarView";
import { VendorQuickStats } from "./VendorQuickStats";
import { VendorWelcome } from "./VendorWelcome";
import { VendorBottomNav } from "./VendorBottomNav";
import { VendorPendingApproval } from "./VendorPendingApproval";

interface VendorDashboardProps {
  initialSection?: string | null;
}

export function VendorDashboard({ initialSection }: VendorDashboardProps) {
  const { user, role, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [showWelcome, setShowWelcome] = useState(false);
  const [vendorApprovalStatus, setVendorApprovalStatus] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!user || !role) return;
      
      // If we have an initialSection, navigate directly without checking welcome
      if (initialSection) {
        if (initialSection === "bookings") {
          setActiveView("bookings");
        } else if (initialSection === "service-bookings") {
          setActiveView("bookings");
        } else {
          setActiveView("dashboard");
        }
      }
      
      // Check if this is a vendor role
      if (role === "hall_owner" || role === "service_provider" || role === "dress_seller") {
        try {
          // Check vendor application approval status
          const { data: application } = await supabase
            .from('vendor_applications')
            .select('status')
            .eq('user_id', user.id)
            .order('applied_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          setVendorApprovalStatus(application?.status || null);

          // Check database for vendor_welcome_seen status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('vendor_welcome_seen')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking welcome status:', error);
          } else if (!profile?.vendor_welcome_seen && application?.status === 'approved') {
            setShowWelcome(true);
          }
        } catch (err) {
          console.error('Error:', err);
        }
      }
      
      setLoading(false);
    };

    checkWelcomeStatus();
  }, [user, role, initialSection]);

  const handleWelcomeComplete = async () => {
    if (user) {
      try {
        // Update database to mark welcome as seen
        await supabase
          .from('profiles')
          .update({ vendor_welcome_seen: true })
          .eq('id', user.id);
      } catch (err) {
        console.error('Error updating welcome status:', err);
      }
    }
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (showWelcome && (role === "hall_owner" || role === "service_provider" || role === "dress_seller")) {
    return <VendorWelcome onComplete={handleWelcomeComplete} vendorType={role} />;
  }

  // Show pending approval screen if vendor is not yet approved
  if (vendorApprovalStatus && vendorApprovalStatus !== 'approved' && 
      (role === "hall_owner" || role === "service_provider" || role === "dress_seller")) {
    return <VendorPendingApproval onLogout={async () => {
      await signOut();
      window.location.href = '/';
    }} />;
  }

  const renderContent = () => {
    // Hall Owner Views
    if (role === "hall_owner") {
      switch (activeView) {
        case "halls":
          return (
            <motion.div
              key="halls"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <HallManagement initialTab="halls" />
            </motion.div>
          );
        case "bookings":
          return (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <HallManagement initialTab="bookings" />
            </motion.div>
          );
        case "calendar":
          return (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">تقويم الحجوزات</h2>
              <BookingCalendarView type="hall" />
            </motion.div>
          );
        case "analytics":
          return (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">الإحصائيات والتحليلات</h2>
              <VendorAnalytics />
            </motion.div>
          );
        default:
          return renderDashboard();
      }
    }

    // Service Provider Views
    if (role === "service_provider") {
      switch (activeView) {
        case "services":
          return (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <ServiceProviderManagement />
            </motion.div>
          );
        case "bookings":
          return (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">إدارة الحجوزات</h2>
              <ServiceBookingManagement />
            </motion.div>
          );
        case "calendar":
          return (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">تقويم الحجوزات</h2>
              <BookingCalendarView type="service" />
            </motion.div>
          );
        case "analytics":
          return (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">الإحصائيات والتحليلات</h2>
              <VendorAnalytics />
            </motion.div>
          );
        default:
          return renderDashboard();
      }
    }

    // Dress Seller Views
    if (role === "dress_seller") {
      switch (activeView) {
        case "dresses":
          return (
            <motion.div
              key="dresses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-24"
            >
              <DressSellerManagement />
            </motion.div>
          );
        case "analytics":
          return (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pb-24"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right pt-4">الإحصائيات والتحليلات</h2>
              <VendorAnalytics />
            </motion.div>
          );
        default:
          return renderDashboard();
      }
    }

    return renderDashboard();
  };

  const renderDashboard = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      {/* Quick Stats */}
      <VendorQuickStats />
      
      {/* Welcome Message */}
      <div className="card-luxe rounded-xl p-5 text-center">
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          مرحباً بك في لوحة التحكم
        </h3>
        <p className="text-muted-foreground font-arabic text-sm">
          استخدم القائمة أدناه للتنقل بين الأقسام المختلفة
        </p>
      </div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleLogout}
        className="w-full bg-destructive/10 rounded-xl p-4 flex items-center justify-between hover:bg-destructive/20 transition-colors"
      >
        <div className="w-5 h-5" />
        <div className="flex items-center gap-3">
          <span className="font-arabic text-destructive font-medium">تسجيل الخروج</span>
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );

  // Validate role is a valid vendor role
  const validRole = role as "hall_owner" | "service_provider" | "dress_seller";
  if (!["hall_owner", "service_provider", "dress_seller"].includes(role || "")) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-arabic">لا توجد صلاحيات كافية</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      
      <VendorBottomNav
        role={validRole}
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  );
}
