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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-between gap-2.5 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 hover:bg-card hover:shadow-xl shadow-sm transition-all duration-300 group w-full h-full"
    >
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
        <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
      </div>
      <span className="text-sm font-arabic text-center text-foreground/90 group-hover:text-primary font-medium leading-tight transition-colors duration-300 min-h-[2.5rem] flex items-center">
        {category.nameAr}
      </span>
    </motion.button>
  );
}
