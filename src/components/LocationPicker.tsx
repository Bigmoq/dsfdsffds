import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Update map URL when coordinates change
  useEffect(() => {
    if (latitude && longitude) {
      setMapUrl(
        `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=15&maptype=roadmap`
      );
    } else {
      setMapUrl("");
    }
  }, [latitude, longitude]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude);
        setIsGettingLocation(false);
      },
      (err) => {
        setError("فشل في تحديد موقعك الحالي");
        setIsGettingLocation(false);
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onLocationChange]);

  const openMapPicker = () => {
    // Open Google Maps in a new window for location selection
    const defaultLat = latitude || 24.7136;
    const defaultLng = longitude || 46.6753;
    
    const mapsUrl = `https://www.google.com/maps?q=${defaultLat},${defaultLng}&z=15&output=embed`;
    
    // Create a modal-like experience for map selection
    const width = 600;
    const height = 500;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const mapWindow = window.open(
      `https://www.google.com/maps/@${defaultLat},${defaultLng},15z`,
      "اختر الموقع",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // Show instructions
    if (mapWindow) {
      alert("انسخ الإحداثيات من رابط الخريطة بعد تحديد الموقع المطلوب\n\nمثال: الأرقام بعد @ في الرابط\nhttps://www.google.com/maps/@24.7136,46.6753,15z");
    }
  };

  const clearLocation = () => {
    onLocationChange(null, null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <Label className="font-arabic flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        موقع القاعة على الخريطة
      </Label>

      {/* Location Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex-1"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <Navigation className="w-4 h-4 ml-2" />
          )}
          <span className="font-arabic">موقعي الحالي</span>
        </Button>
      </div>

      {/* Manual Coordinates Input */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-arabic">خط العرض (Latitude)</label>
          <input
            type="number"
            step="any"
            value={latitude || ""}
            onChange={(e) => onLocationChange(e.target.value ? parseFloat(e.target.value) : null, longitude)}
            placeholder="24.7136"
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background text-left"
            dir="ltr"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-arabic">خط الطول (Longitude)</label>
          <input
            type="number"
            step="any"
            value={longitude || ""}
            onChange={(e) => onLocationChange(latitude, e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="46.6753"
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background text-left"
            dir="ltr"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive font-arabic">{error}</p>
      )}

      {/* Location Status */}
      {latitude && longitude && (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocation}
            className="text-destructive text-xs"
          >
            مسح
          </Button>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-arabic">تم تحديد الموقع</span>
          </div>
        </div>
      )}

      {/* Map Preview */}
      {mapUrl && (
        <div className="w-full h-40 rounded-xl overflow-hidden border border-border">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع القاعة"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground font-arabic text-center">
        يمكنك الضغط على "موقعي الحالي" أو إدخال الإحداثيات يدوياً
      </p>
    </div>
  );
}
