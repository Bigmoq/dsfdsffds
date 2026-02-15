import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PaymentResult = "verifying" | "success" | "failed";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentResult>("verifying");
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get("id");
  const bookingId = searchParams.get("booking_id");
  const paymentStatus = searchParams.get("status");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId || !bookingId) {
        setStatus("failed");
        setError("بيانات الدفع غير مكتملة");
        return;
      }

      // If Moyasar already says failed
      if (paymentStatus === "failed") {
        setStatus("failed");
        setError("فشلت عملية الدفع");
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("verify-payment", {
          body: { payment_id: paymentId, booking_id: bookingId },
        });

        if (fnError) throw fnError;

        if (data?.verified) {
          setStatus("success");
        } else {
          setStatus("failed");
          setError(data?.error || "لم يتم التحقق من الدفع");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setStatus("failed");
        setError("حدث خطأ أثناء التحقق من الدفع");
      }
    };

    verifyPayment();
  }, [paymentId, bookingId, paymentStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          {status === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">جاري التحقق من الدفع...</h2>
                <p className="text-muted-foreground">يرجى الانتظار</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">تم تأكيد الحجز!</h2>
                <p className="text-muted-foreground">تم دفع 1 ر.س بنجاح</p>
              </div>
              <Button onClick={() => navigate("/")} className="w-full max-w-xs">
                العودة لحجوزاتي
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">فشل الدفع</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full max-w-xs">
                العودة للرئيسية
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
