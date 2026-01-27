import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, ShoppingBag, Package, Plus, ArrowRight, Loader2, BarChart3, CalendarCheck, CalendarDays, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HallManagement } from "./HallManagement";
import { ServiceProviderManagement } from "./ServiceProviderManagement";
import { DressSellerManagement } from "./DressSellerManagement";
import { VendorAnalytics } from "./VendorAnalytics";
import { ServiceBookingManagement } from "./ServiceBookingManagement";
import { BookingCalendarView } from "./BookingCalendarView";
import { VendorQuickStats } from "./VendorQuickStats";
import { VendorWelcome } from "./VendorWelcome";

interface VendorDashboardProps {
  initialSection?: string | null;
}

export function VendorDashboard({ initialSection }: VendorDashboardProps) {
  const { user, role, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

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
          setActiveView("hall_bookings");
        } else if (initialSection === "service-bookings") {
          setActiveView("service_bookings");
        } else {
          setActiveView(role);
        }
        setLoading(false);
        return;
      }
      
      // Check if this is a vendor role
      if (role === "hall_owner" || role === "service_provider" || role === "dress_seller") {
        try {
          // Check database for vendor_welcome_seen status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('vendor_welcome_seen')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking welcome status:', error);
            setActiveView(role);
          } else if (!profile?.vendor_welcome_seen) {
            setShowWelcome(true);
          } else {
            setActiveView(role);
          }
        } catch (err) {
          console.error('Error:', err);
          setActiveView(role);
        }
      } else if (role !== "user") {
        setActiveView(role);
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
    setActiveView(role);
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

  if (activeView === "hall_owner" || activeView === "hall_bookings") {
    return (
      <div>
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <HallManagement initialTab={activeView === "hall_bookings" ? "bookings" : "halls"} />
      </div>
    );
  }

  if (activeView === "service_provider") {
    return (
      <div>
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <ServiceProviderManagement />
      </div>
    );
  }

  if (activeView === "service_bookings") {
    return (
      <div>
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="px-4">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right">إدارة الحجوزات</h2>
          <ServiceBookingManagement />
        </div>
      </div>
    );
  }

  if (activeView === "service_calendar") {
    return (
      <div>
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="px-4">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 text-right">تقويم الحجوزات</h2>
          <BookingCalendarView type="service" />
        </div>
      </div>
    );
  }

  if (activeView === "dress_seller") {
    return (
      <div>
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-4"
        >
          <span className="font-arabic text-sm">العودة للوحة التحكم</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <DressSellerManagement />
      </div>
    );
  }

  // Show role-based dashboard options
  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <VendorQuickStats />
      
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-foreground text-right">
          لوحة التحكم
        </h3>
        
        {role === "hall_owner" && (
          <>
            {/* Hall Management - First */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveView("hall_owner")}
              className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
            >
              <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-bold text-foreground">
                  إدارة القاعات
                </h4>
                <p className="text-muted-foreground font-arabic text-sm">
                  أضف قاعاتك وأدر الحجوزات والتواريخ
                </p>
              </div>
            </motion.button>

            {/* Analytics Card - Second */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <VendorAnalytics />
            </motion.div>
          </>
        )}
        
        {role === "service_provider" && (
          <>
            {/* Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VendorAnalytics />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setActiveView("service_provider")}
              className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
            >
              <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-bold text-foreground">
                  إدارة الخدمات
                </h4>
                <p className="text-muted-foreground font-arabic text-sm">
                  أضف خدماتك وباقات الأسعار
                </p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setActiveView("service_bookings")}
              className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-bold text-foreground">
                  إدارة الحجوزات
                </h4>
                <p className="text-muted-foreground font-arabic text-sm">
                  راجع وأدر الحجوزات الواردة
                </p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setActiveView("service_calendar")}
              className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-lg font-bold text-foreground">
                  تقويم الحجوزات
                </h4>
                <p className="text-muted-foreground font-arabic text-sm">
                  عرض الحجوزات على التقويم
                </p>
              </div>
            </motion.button>
          </>
        )}
        
        {role === "dress_seller" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActiveView("dress_seller")}
            className="w-full card-luxe rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all text-right"
          >
            <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-lg font-bold text-foreground">
                إدارة الفساتين
              </h4>
              <p className="text-muted-foreground font-arabic text-sm">
                أضف فساتينك وأدر الإعلانات
              </p>
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Empty State - shouldn't happen but just in case */}
      {!role || role === "user" && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            لا توجد خدمات
          </h3>
          <p className="text-muted-foreground font-arabic text-sm">
            انضم كمقدم خدمة من صفحة الحساب
          </p>
        </div>
      )}

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleLogout}
        className="w-full bg-destructive/10 rounded-xl p-4 flex items-center justify-between hover:bg-destructive/20 transition-colors mt-6"
      >
        <div className="w-5 h-5" />
        <div className="flex items-center gap-3">
          <span className="font-arabic text-destructive font-medium">تسجيل الخروج</span>
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </motion.button>
    </div>
  );
}
