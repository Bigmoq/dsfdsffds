import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";

export function VendorPendingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4"
    >
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4" dir="rtl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-right">
            <h3 className="font-display text-sm font-bold text-foreground">
              حسابك قيد المراجعة
            </h3>
            <p className="text-xs text-muted-foreground font-arabic">
              يمكنك إضافة بياناتك الآن وستظهر للعملاء تلقائياً عند الموافقة
            </p>
          </div>
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "50%" }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground font-arabic">بانتظار الموافقة</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-500 font-arabic">تم الإرسال</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
