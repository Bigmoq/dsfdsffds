import { motion } from "framer-motion";
import { User, Settings, Bell, HelpCircle, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: User, label: "الملف الشخصي", labelEn: "Profile" },
  { icon: Bell, label: "الإشعارات", labelEn: "Notifications" },
  { icon: Settings, label: "الإعدادات", labelEn: "Settings" },
  { icon: HelpCircle, label: "المساعدة", labelEn: "Help" },
];

export function ProfileScreen() {
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
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            مرحباً بك
          </h2>
          <p className="text-muted-foreground font-arabic text-sm mb-4">
            سجل دخولك للاستفادة من جميع المميزات
          </p>
          
          <Button className="gold-gradient text-white hover:opacity-90 w-full">
            <span className="font-arabic">تسجيل الدخول</span>
          </Button>
        </motion.div>
      </div>
      
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
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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
      </div>
    </div>
  );
}
