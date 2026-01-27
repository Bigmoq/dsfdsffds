import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImagePreviewDialogProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
}

export function ImagePreviewDialog({
  images,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ImagePreviewDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const handlePrevious = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
    setZoom(1);
  };

  const handleNext = () => {
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Reset zoom when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      setZoom(1);
    }
    onOpenChange(isOpen);
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Zoom Controls */}
        <div className="absolute top-2 left-2 z-50 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <span className="text-white text-sm flex items-center px-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          </>
        )}

        {/* Main Image */}
        <div className="w-full h-[90vh] flex items-center justify-center overflow-auto p-4">
          <img
            src={images[activeIndex]}
            alt=""
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/60 p-2 rounded-lg max-w-[80vw] overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  onIndexChange?.(idx);
                  setZoom(1);
                }}
                className={`w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                  idx === activeIndex
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
