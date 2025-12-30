import { useState } from "react";
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AddVendorReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onSuccess: () => void;
}

export function AddVendorReviewSheet({
  open,
  onOpenChange,
  providerId,
  providerName,
  existingReview,
  onSuccess,
}: AddVendorReviewSheetProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "الرجاء تسجيل الدخول لإضافة تقييم",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "اختر تقييماً",
        description: "الرجاء اختيار عدد النجوم",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('service_provider_reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id);

        if (error) throw error;

        toast({
          title: "تم تحديث التقييم",
          description: "شكراً لتحديث تقييمك",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('service_provider_reviews')
          .insert({
            provider_id: providerId,
            user_id: user.id,
            rating,
            comment: comment.trim() || null,
          });

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "لقد قمت بتقييم هذه الخدمة مسبقاً",
              description: "يمكنك تعديل تقييمك الحالي",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "تم إضافة التقييم",
          description: "شكراً لمشاركة رأيك",
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "حدث خطأ",
        description: "تعذر حفظ التقييم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment("");
  };

  const displayRating = hoverRating || rating;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl p-0">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </button>
            <SheetTitle className="font-display text-lg">
              {existingReview ? "تعديل التقييم" : "إضافة تقييم"}
            </SheetTitle>
          </div>

          {/* Provider Name */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground font-arabic text-sm">تقييم</p>
            <h3 className="font-display text-xl font-bold text-foreground">
              {providerName}
            </h3>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= displayRating
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Rating Text */}
          <div className="text-center mb-6">
            <p className="font-arabic text-sm text-muted-foreground">
              {displayRating === 0 && "اضغط على النجوم للتقييم"}
              {displayRating === 1 && "سيء جداً"}
              {displayRating === 2 && "سيء"}
              {displayRating === 3 && "متوسط"}
              {displayRating === 4 && "جيد"}
              {displayRating === 5 && "ممتاز"}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <Textarea
              placeholder="شاركنا تجربتك مع هذه الخدمة... (اختياري)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] text-right resize-none"
              maxLength={500}
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground text-left mt-1">
              {comment.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
          >
            {loading ? "جاري الحفظ..." : existingReview ? "تحديث التقييم" : "إرسال التقييم"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}