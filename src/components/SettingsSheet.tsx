import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Volume2, 
  Mail,
  Smartphone,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Language = "ar" | "en";
type Theme = "light" | "dark" | "system";

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);

  // Language
  const [language, setLanguage] = useState<Language>("ar");

  // Theme
  const [theme, setTheme] = useState<Theme>("light");

  // Load saved settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLanguage = localStorage.getItem("language") as Language;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);
    
    // Apply theme on load
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    toast.success("تم تغيير المظهر بنجاح");
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    toast.success(newLang === "ar" ? "تم تغيير اللغة إلى العربية" : "Language changed to English");
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    switch (setting) {
      case "push":
        setPushNotifications(value);
        break;
      case "email":
        setEmailNotifications(value);
        break;
      case "sound":
        setSoundEnabled(value);
        break;
      case "reminders":
        setBookingReminders(value);
        break;
      case "priceAlerts":
        setPriceAlerts(value);
        break;
    }
    toast.success("تم حفظ الإعدادات");
  };

  const themeOptions = [
    { value: "light" as Theme, label: "فاتح", icon: Sun },
    { value: "dark" as Theme, label: "داكن", icon: Moon },
  ];

  const languageOptions = [
    { value: "ar" as Language, label: "العربية", flag: "🇸🇦" },
    { value: "en" as Language, label: "English", flag: "🇺🇸" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-right font-display">الإعدادات</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Appearance Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">المظهر</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <option.icon className={`w-6 h-6 ${theme === option.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${theme === option.value ? "text-primary" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  {theme === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.section>

          <Separator />

          {/* Language Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">اللغة</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                    language === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <span className={`text-sm font-medium ${language === option.value ? "text-primary" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  {language === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.section>

          <Separator />

          {/* Notifications Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">الإشعارات</h3>
            </div>

            <div className="space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">إشعارات الجوال</Label>
                    <p className="text-xs text-muted-foreground">استلم إشعارات على جوالك</p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={(value) => handleNotificationChange("push", value)}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">إشعارات البريد</Label>
                    <p className="text-xs text-muted-foreground">استلم التحديثات على بريدك</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(value) => handleNotificationChange("email", value)}
                />
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">الأصوات</Label>
                    <p className="text-xs text-muted-foreground">تشغيل صوت عند وصول إشعار</p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={(value) => handleNotificationChange("sound", value)}
                />
              </div>

              {/* Booking Reminders */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">تذكيرات الحجوزات</Label>
                    <p className="text-xs text-muted-foreground">تذكير قبل موعد الحجز</p>
                  </div>
                </div>
                <Switch
                  checked={bookingReminders}
                  onCheckedChange={(value) => handleNotificationChange("reminders", value)}
                />
              </div>

              {/* Price Alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">تنبيهات الأسعار</Label>
                    <p className="text-xs text-muted-foreground">إشعار عند تغير سعر المفضلة</p>
                  </div>
                </div>
                <Switch
                  checked={priceAlerts}
                  onCheckedChange={(value) => handleNotificationChange("priceAlerts", value)}
                />
              </div>
            </div>
          </motion.section>

          {/* App Version */}
          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">الإصدار 1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
