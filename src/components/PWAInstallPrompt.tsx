import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Show iOS instructions
  if (isIOS && !showPrompt) {
    const iosDismissed = localStorage.getItem('pwa-ios-dismissed');
    if (iosDismissed) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-xl p-4 shadow-lg"
        >
          <button
            onClick={() => {
              localStorage.setItem('pwa-ios-dismissed', 'true');
              setIsIOS(false);
            }}
            className="absolute top-2 left-2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-right pr-2">
            <h3 className="font-semibold text-foreground mb-2">تثبيت التطبيق</h3>
            <p className="text-sm text-muted-foreground">
              اضغط على زر المشاركة{' '}
              <span className="inline-block px-1">⬆️</span>
              {' '}ثم اختر "إضافة إلى الشاشة الرئيسية"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show install prompt for Android/Desktop
  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-xl p-4 shadow-lg"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 left-2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 text-right">
            <h3 className="font-semibold text-foreground mb-1">تثبيت التطبيق</h3>
            <p className="text-sm text-muted-foreground">
              ثبّت التطبيق على جهازك للوصول السريع
            </p>
          </div>
          
          <Button onClick={handleInstall} className="gap-2">
            <Download className="w-4 h-4" />
            تثبيت
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
