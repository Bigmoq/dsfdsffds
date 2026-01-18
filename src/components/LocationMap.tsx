import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDistance, formatDistance } from "@/hooks/useGeolocation";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  userLatitude?: number | null;
  userLongitude?: number | null;
}

export function LocationMap({ 
  latitude, 
  longitude, 
  name, 
  address,
  userLatitude,
  userLongitude 
}: LocationMapProps) {
  const distance = userLatitude && userLongitude
    ? calculateDistance(userLatitude, userLongitude, latitude, longitude)
    : null;

  const openInMaps = () => {
    // Open in Google Maps with directions if user location available
    if (userLatitude && userLongitude) {
      window.open(
        `https://www.google.com/maps/dir/${userLatitude},${userLongitude}/${latitude},${longitude}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  // Create static map URL using OpenStreetMap tiles via an iframe-friendly embed
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Map Preview */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
        <iframe
          src={mapEmbedUrl}
          className="w-full h-40"
          style={{ border: 0 }}
          loading="lazy"
          title={`موقع ${name}`}
        />
        
        {/* Distance Badge */}
        {distance !== null && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-bold font-arabic">
              {formatDistance(distance)}
            </span>
          </div>
        )}
      </div>

      {/* Address and Actions */}
      <div className="flex items-start justify-between gap-3">
        <Button
          onClick={openInMaps}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="font-arabic">افتح في الخريطة</span>
        </Button>
        
        {address && (
          <div className="flex items-start gap-2 text-right">
            <p className="text-sm text-muted-foreground font-arabic">{address}</p>
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
