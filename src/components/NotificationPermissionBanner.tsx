import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationPermissionBanner() {
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1 text-right">
              <h4 className="font-bold text-sm mb-1">تفعيل الإشعارات</h4>
              <p className="text-xs opacity-90 mb-3">
                احصل على إشعارات فورية عند وصول حجوزات جديدة
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="text-primary-foreground hover:bg-white/20"
                >
                  لاحقاً
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEnable}
                  disabled={loading}
                >
                  {loading ? 'جاري التفعيل...' : 'تفعيل'}
                </Button>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
