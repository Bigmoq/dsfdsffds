import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface MoyasarPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // in SAR
  bookingId: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
}

const MOYASAR_SCRIPT_URL = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.js";
const MOYASAR_CSS_URL = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.css";

export function MoyasarPaymentModal({
  isOpen,
  onClose,
  amount,
  bookingId,
  description = "دفع حجز",
  onSuccess,
}: MoyasarPaymentModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      initRef.current = false;
      setLoading(true);
      return;
    }

    const loadMoyasar = async () => {
      // Load CSS if not already loaded
      if (!document.querySelector(`link[href="${MOYASAR_CSS_URL}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = MOYASAR_CSS_URL;
        document.head.appendChild(link);
      }

      // Load JS if not already loaded
      if (!window.Moyasar) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = MOYASAR_SCRIPT_URL;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Moyasar"));
          document.body.appendChild(script);
        });
      }

      // Wait for container to be ready
      await new Promise((r) => setTimeout(r, 100));

      if (!containerRef.current || initRef.current) return;
      initRef.current = true;

      const publishableKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;
      if (!publishableKey) {
        console.error("VITE_MOYASAR_PUBLISHABLE_KEY is not set");
        return;
      }

      // Build callback URL
      const callbackUrl = `${window.location.origin}/payment-status?booking_id=${bookingId}`;

      // Amount in Halalas (1 SAR = 100 Halalas)
      const amountInHalalas = amount * 100;

      window.Moyasar.init({
        element: "#moyasar-payment-form",
        amount: amountInHalalas,
        currency: "SAR",
        description: `${description} - ${bookingId}`,
        publishable_api_key: publishableKey,
        callback_url: callbackUrl,
        methods: ["creditcard", "applepay", "stcpay"],
        fixed_width: false,
      });

      setLoading(false);
    };

    loadMoyasar().catch(console.error);
  }, [isOpen, bookingId, amount, description]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إتمام الدفع</DialogTitle>
          <DialogDescription>
            المبلغ المطلوب: <span className="font-bold text-primary">{amount.toFixed(2)} ر.س</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground">جاري تحميل نموذج الدفع...</span>
            </div>
          )}
          <div id="moyasar-payment-form" ref={containerRef} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
