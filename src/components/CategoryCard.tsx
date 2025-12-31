import { motion } from "framer-motion";
import { ServiceCategory } from "@/data/weddingData";
import { categoryImages } from "@/data/categoryImages";

interface CategoryCardProps {
  category: ServiceCategory;
  index: number;
  onClick: () => void;
}

export function CategoryCard({ category, index, onClick }: CategoryCardProps) {
  const Icon = category.icon;
  const backgroundImage = categoryImages[category.id];
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-end overflow-hidden rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group aspect-[3/4]"
    >
      {/* Background Image or Gradient */}
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt={category.nameAr}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2 p-3 pb-4 w-full">
        <div className={`p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-md group-hover:shadow-lg transition-all duration-300 ${backgroundImage ? '' : `bg-gradient-to-br ${category.color}`}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-arabic text-center text-white font-medium leading-tight drop-shadow-md">
          {category.nameAr}
        </span>
      </div>
    </motion.button>
  );
}
