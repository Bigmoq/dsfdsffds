import { Navigation } from "lucide-react";
import { calculateDistance, formatDistance } from "@/hooks/useGeolocation";

interface DistanceBadgeProps {
  hallLatitude?: number | null;
  hallLongitude?: number | null;
  userLatitude?: number | null;
  userLongitude?: number | null;
  className?: string;
}

export function DistanceBadge({
  hallLatitude,
  hallLongitude,
  userLatitude,
  userLongitude,
  className = "",
}: DistanceBadgeProps) {
  // Don't render if we don't have both locations
  if (!hallLatitude || !hallLongitude || !userLatitude || !userLongitude) {
    return null;
  }

  const distance = calculateDistance(
    userLatitude,
    userLongitude,
    hallLatitude,
    hallLongitude
  );

  return (
    <div
      className={`flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full ${className}`}
    >
      <Navigation className="w-3 h-3" />
      <span className="text-xs font-semibold font-arabic">
        {formatDistance(distance)}
      </span>
    </div>
  );
}
