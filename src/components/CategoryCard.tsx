import { motion } from "framer-motion";
import { ServiceCategory } from "@/data/weddingData";

interface CategoryCardProps {
  category: ServiceCategory;
  index: number;
  onClick: () => void;
}

export function CategoryCard({ category, index, onClick }: CategoryCardProps) {
  const Icon = category.icon;
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-arabic text-center text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
        {category.nameAr}
      </span>
    </motion.button>
  );
}
