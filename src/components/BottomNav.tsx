import { motion } from "framer-motion";
import { Home, Briefcase, Heart, User } from "lucide-react";

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const navItems = [
  { icon: Home, label: "الرئيسية", labelEn: "Home" },
  { icon: Briefcase, label: "الخدمات", labelEn: "Services" },
  { icon: Heart, label: "المفضلة", labelEn: "Favorites" },
  { icon: User, label: "حسابي", labelEn: "Profile" },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === index;
          
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className="relative flex flex-col items-center gap-1 py-2 px-4 transition-all duration-300"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -4 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              
              <span className={`text-xs font-arabic transition-colors duration-300 ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
