import { motion } from "framer-motion";
import { Home, Grid, Heart, User, Sparkles } from "lucide-react";

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const navItems = [
  { index: 0, icon: Grid, label: "الخدمات", labelEn: "Services" },
  { index: 1, icon: Sparkles, label: "الفساتين", labelEn: "Dresses" },
  { index: 2, icon: Home, label: "الرئيسية", labelEn: "Home", isMain: true },
  { index: 3, icon: Heart, label: "المفضلة", labelEn: "Favorites" },
  { index: 4, icon: User, label: "حسابي", labelEn: "Profile" },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl max-w-lg mx-auto px-2 py-3">
        <div className="flex items-end justify-between relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.index;

            if (item.isMain) {
              return (
                <div key={item.index} className="relative -top-10 px-2">
                  <button
                    onClick={() => setActiveTab(item.index)}
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
                key={item.index}
                onClick={() => setActiveTab(item.index)}
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
