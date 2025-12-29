import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function FavoritesScreen() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary/10 px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            المفضلة
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            قاعاتك وخدماتك المفضلة
          </p>
        </motion.div>
      </div>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mb-6 shadow-xl"
        >
          <Heart className="w-12 h-12 text-white" />
        </motion.div>
        
        <h2 className="font-display text-2xl font-bold text-foreground mb-3 text-center">
          لا توجد مفضلات بعد
        </h2>
        <p className="text-muted-foreground font-arabic text-center max-w-xs">
          احفظ قاعاتك ومقدمي خدماتك المفضلين هنا للوصول السريع
        </p>
      </div>
    </div>
  );
}
