import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    navigator.vibrate(patterns[type]);
  }
};

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const pullDistance = useMotionValue(0);
  const pullProgress = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 1]);
  const iconRotation = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 180]);
  const indicatorOpacity = useTransform(pullDistance, [0, 30], [0, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only activate if scrolled to top
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
      setHasTriggeredHaptic(false);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setHasTriggeredHaptic(false);
      pullDistance.set(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const delta = Math.max(0, currentY.current - startY.current);
    
    // Apply resistance for over-pull
    const resistance = delta > PULL_THRESHOLD ? 0.3 : 0.5;
    const adjustedDelta = Math.min(delta * resistance, MAX_PULL);
    
    pullDistance.set(adjustedDelta);
    
    // Trigger haptic when crossing threshold
    if (adjustedDelta >= PULL_THRESHOLD && !hasTriggeredHaptic) {
      triggerHaptic('light');
      setHasTriggeredHaptic(true);
    } else if (adjustedDelta < PULL_THRESHOLD && hasTriggeredHaptic) {
      setHasTriggeredHaptic(false);
    }
    
    // Prevent default scroll when pulling
    if (delta > 0) {
      e.preventDefault();
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, hasTriggeredHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    setHasTriggeredHaptic(false);
    const distance = pullDistance.get();
    
    if (distance >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger stronger haptic on refresh
      triggerHaptic('medium');
      setIsRefreshing(true);
      
      // Animate to loading position
      animate(pullDistance, 60, { duration: 0.2 });
      
      try {
        await onRefresh();
      } finally {
        // Animate back
        animate(pullDistance, 0, { duration: 0.3 });
        setIsRefreshing(false);
      }
    } else {
      // Spring back
      animate(pullDistance, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, onRefresh]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div 
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50"
        style={{ 
          top: 0,
          height: pullDistance,
          opacity: indicatorOpacity,
        }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
          style={{ scale: pullProgress }}
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <motion.div style={{ rotate: iconRotation }}>
              <ArrowDown className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  );
}
