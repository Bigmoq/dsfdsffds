import { X, MapPin, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dress } from "@/data/weddingData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DressDetailsSheetProps {
  dress: Dress | null;
  open: boolean;
  onClose: () => void;
}

export function DressDetailsSheet({ dress, open, onClose }: DressDetailsSheetProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!dress) return null;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`مرحباً، أنا مهتمة بالفستان: ${dress.title}`);
    window.open(`https://wa.me/${dress.phone}?text=${message}`, "_blank");
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % dress.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + dress.images.length) % dress.images.length);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Image Slider */}
          <div className="relative aspect-[3/4] max-h-[50vh] bg-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={dress.images[currentImage]}
                alt={dress.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            {dress.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Dots */}
            {dress.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {dress.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImage ? "bg-primary w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <SheetHeader className="text-right">
              <SheetTitle className="font-arabic text-xl">{dress.title}</SheetTitle>
            </SheetHeader>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {dress.price.toLocaleString()} ر.س
              </span>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="bg-secondary px-3 py-1 rounded-full text-sm">
                  مقاس: {dress.size}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {dress.city}
                </span>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-arabic font-semibold mb-2">البائعة</h4>
              <p className="text-muted-foreground">{dress.sellerName}</p>
            </div>

            <div>
              <h4 className="font-arabic font-semibold mb-2">الوصف</h4>
              <p className="text-muted-foreground leading-relaxed">{dress.description}</p>
            </div>
          </div>

          {/* Sticky WhatsApp Button */}
          <div className="p-4 border-t border-border bg-background">
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-arabic rounded-xl"
            >
              <MessageCircle className="w-5 h-5 ml-2" />
              تواصل عبر واتساب
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
