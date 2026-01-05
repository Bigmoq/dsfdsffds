import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Settings, Bell, HelpCircle, LogOut, ChevronLeft, Building2, Briefcase, Crown, Package, ShoppingBag, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { VendorApplicationSheet } from "./VendorApplicationSheet";
import { VendorDashboard } from "./VendorDashboard";
import { MyBookings } from "./MyBookings";
import { AdminPanel } from "./AdminPanel";
import { NotificationsSheet } from "./NotificationsSheet";
import { SettingsSheet } from "./SettingsSheet";
import { toast } from "sonner";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated, role, isVendor, isAdmin } = useAuth();
  const [showVendorSheet, setShowVendorSheet] = useState(false);
  const [showVendorDashboard, setShowVendorDashboard] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { icon: User, label: "الملف الشخصي", labelEn: "Profile", action: () => toast.info("قريباً - الملف الشخصي") },
    { icon: Bell, label: "الإشعارات", labelEn: "Notifications", action: () => setShowNotifications(true) },
    { icon: Settings, label: "الإعدادات", labelEn: "Settings", action: () => setShowSettings(true) },
    { icon: HelpCircle, label: "المساعدة", labelEn: "Help", action: () => toast.info("قريباً - المساعدة") },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleLabel = () => {
    switch (role) {
      case "hall_owner": return "صاحب قاعة";
      case "service_provider": return "مقدم خدمة";
      case "dress_seller": return "بائع فساتين";
      case "admin": return "مدير";
      default: return "مستخدم";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "hall_owner": return Building2;
      case "service_provider": return Package;
      case "dress_seller": return ShoppingBag;
      case "admin": return Shield;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // My Bookings View
  if (showMyBookings && isAuthenticated) {
    return (
      <div className="min-h-screen pb-24">
        <div className="gold-gradient px-4 pt-12 pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <button
            onClick={() => setShowMyBookings(false)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <span className="font-arabic text-sm">العودة للحساب</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              حجوزاتي
            </h1>
            <p className="text-white/80 font-arabic text-sm">
              متابعة حجوزات القاعات
            </p>
          </motion.div>
        </div>
        
        <div className="p-4">
          <MyBookings />
        </div>
      </div>
    );
  }

  // Admin Panel View
  if (showAdminPanel && isAuthenticated && isAdmin) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-12 pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <button
            onClick={() => setShowAdminPanel(false)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <span className="font-arabic text-sm">العودة للحساب</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              لوحة الإدارة
            </h1>
            <p className="text-white/80 font-arabic text-sm">
              إدارة طلبات الانضمام
            </p>
          </motion.div>
        </div>
        
        <div className="p-4">
          <AdminPanel />
        </div>
      </div>
    );
  }

  if (showVendorDashboard && isAuthenticated && isVendor) {
    return (
      <div className="min-h-screen pb-24">
        <div className="gold-gradient px-4 pt-12 pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <button
            onClick={() => setShowVendorDashboard(false)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <span className="font-arabic text-sm">العودة للحساب</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              لوحة التحكم
            </h1>
            <p className="text-white/80 font-arabic text-sm">
              إدارة خدماتك وحجوزاتك
            </p>
          </motion.div>
        </div>
        
        <VendorDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gold-gradient px-4 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMTBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10"
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            حسابي
          </h1>
          <p className="text-white/80 font-arabic text-sm">
            إدارة حسابك وإعداداتك
          </p>
        </motion.div>
      </div>
      
      {/* Profile Card */}
      <div className="px-4 -mt-10 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxe rounded-2xl p-6 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
            {(() => {
              const RoleIcon = getRoleIcon();
              return <RoleIcon className="w-10 h-10 text-muted-foreground" />;
            })()}
          </div>
          
          {isAuthenticated ? (
            <>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                {user?.user_metadata?.full_name || "مرحباً بك"}
              </h2>
              <p className="text-muted-foreground font-arabic text-sm mb-2">
                {user?.email}
              </p>
              {role && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-arabic">
                  {getRoleLabel()}
                </span>
              )}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                مرحباً بك
              </h2>
              <p className="text-muted-foreground font-arabic text-sm mb-4">
                سجل دخولك للاستفادة من جميع المميزات
              </p>
              
              <Button
                onClick={() => navigate("/auth")}
                className="gold-gradient text-white hover:opacity-90 w-full"
              >
                <span className="font-arabic">تسجيل الدخول</span>
              </Button>
            </>
          )}
        </motion.div>
      </div>

      {/* My Bookings Button - For authenticated users */}
      {isAuthenticated && (
        <div className="px-4 mt-6">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowMyBookings(true)}
            className="w-full card-luxe rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <span className="font-arabic text-foreground">حجوزاتي</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </motion.button>
        </div>
      )}
      
      {/* Vendor Dashboard Button - Only for vendors */}
      {isAuthenticated && isVendor && (
        <div className="px-4 mt-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowVendorDashboard(true)}
            className="w-full card-luxe rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <span className="font-arabic text-foreground">لوحة تحكم البائع</span>
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Admin Panel Button - Only for admins */}
      {isAuthenticated && isAdmin && (
        <div className="px-4 mt-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAdminPanel(true)}
            className="w-full card-luxe rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow border-2 border-slate-700"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <span className="font-arabic text-foreground">لوحة الإدارة</span>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.button>
        </div>
      )}
      
      {/* Upgrade to Vendor - Only for regular users */}
      {isAuthenticated && role === "user" && (
        <div className="px-4 mt-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowVendorSheet(true)}
            className="w-full card-luxe rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow border-2 border-dashed border-primary/30"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
            <div className="flex items-center gap-3">
              <span className="font-arabic text-primary font-semibold">انضم كمقدم خدمة</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
            </div>
          </motion.button>
        </div>
      )}
      
      {/* Menu Items */}
      <div className="px-4 mt-6 space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={item.action}
              className="w-full card-luxe rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-3">
                <span className="font-arabic text-foreground">{item.label}</span>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </motion.button>
          );
        })}
        
        {/* Logout */}
        {isAuthenticated && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleLogout}
            className="w-full bg-destructive/10 rounded-xl p-4 flex items-center justify-between hover:bg-destructive/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-destructive" />
            <div className="flex items-center gap-3">
              <span className="font-arabic text-destructive">تسجيل الخروج</span>
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </motion.button>
        )}
      </div>
      
      <VendorApplicationSheet
        open={showVendorSheet}
        onOpenChange={setShowVendorSheet}
      />
      
      <NotificationsSheet
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
      
      <SettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
