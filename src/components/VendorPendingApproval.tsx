import { motion } from "framer-motion";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface VendorPendingApprovalProps {
  onLogout: () => void;
}

export function VendorPendingApproval({ onLogout }: VendorPendingApprovalProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-12 h-12 text-amber-500" />
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-3">
          حسابك قيد المراجعة
        </h1>
        
        <p className="text-muted-foreground font-arabic text-base leading-relaxed mb-6">
          تم استلام طلبك بنجاح وسيتم مراجعته من قبل الإدارة. سنقوم بإعلامك فور تفعيل حسابك.
        </p>

        <div className="card-luxe rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-arabic text-sm text-foreground">تم إرسال الطلب</span>
            </div>
          </div>
          <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground font-arabic">بانتظار الموافقة</span>
            <span className="text-xs text-green-500 font-arabic">تم الإرسال</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full"
        >
          <span className="font-arabic">تسجيل الخروج</span>
        </Button>
      </motion.div>
    </div>
  );
}
