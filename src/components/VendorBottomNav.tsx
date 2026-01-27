import { motion } from "framer-motion";
import { Building2, Package, CalendarCheck, CalendarDays, BarChart3, ShoppingBag, Home } from "lucide-react";

type VendorRole = "hall_owner" | "service_provider" | "dress_seller";

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface VendorBottomNavProps {
  role: VendorRole;
  activeView: string;
  onViewChange: (view: string) => void;
}

const hallOwnerItems: NavItem[] = [
  { id: "analytics", icon: BarChart3, label: "الإحصائيات" },
  { id: "bookings", icon: CalendarCheck, label: "الحجوزات" },
  { id: "dashboard", icon: Home, label: "الرئيسية" },
  { id: "calendar", icon: CalendarDays, label: "التقويم" },
  { id: "halls", icon: Building2, label: "القاعات" },
];

const serviceProviderItems: NavItem[] = [
  { id: "analytics", icon: BarChart3, label: "الإحصائيات" },
  { id: "bookings", icon: CalendarCheck, label: "الحجوزات" },
  { id: "dashboard", icon: Home, label: "الرئيسية" },
  { id: "calendar", icon: CalendarDays, label: "التقويم" },
  { id: "services", icon: Package, label: "الخدمات" },
];

const dressSellerItems: NavItem[] = [
  { id: "analytics", icon: BarChart3, label: "الإحصائيات" },
  { id: "dashboard", icon: Home, label: "الرئيسية" },
  { id: "dresses", icon: ShoppingBag, label: "الفساتين" },
];

export function VendorBottomNav({ role, activeView, onViewChange }: VendorBottomNavProps) {
  const getItems = (): NavItem[] => {
    switch (role) {
      case "hall_owner":
        return hallOwnerItems;
      case "service_provider":
        return serviceProviderItems;
      case "dress_seller":
        return dressSellerItems;
      default:
        return [];
    }
  };

  const items = getItems();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl max-w-lg mx-auto px-2 py-3">
        <div className="flex items-end justify-between relative">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isMain = item.id === "dashboard";

            if (isMain) {
              return (
                <div key={item.id} className="relative -top-10 px-2">
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 border-4 border-card ${
                      isActive
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/50"
                        : "bg-muted text-muted-foreground hover:bg-primary/20"
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                  </button>
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="flex-1 flex flex-col items-center gap-1 py-1 transition-all duration-300 group"
              >
                <div className="relative p-1">
                  <motion.div
                    animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -2 : 0 }}
                    className={`${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                </div>
                <span className={`text-[9px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
