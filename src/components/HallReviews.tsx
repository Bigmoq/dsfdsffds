import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

interface HallReviewsProps {
  hallId: string;
  hallName: string;
}

export function HallReviews({ hallId, hallName }: HallReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkCanReview();
    }
  }, [hallId, user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from("hall_reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("hall_id", hallId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", review.user_id)
            .maybeSingle();
          return { ...review, profiles: profile };
        })
      );

      setReviews(reviewsWithProfiles);

      // Calculate average
      if (reviewsWithProfiles.length > 0) {
        const avg = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0) / reviewsWithProfiles.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setReviewsCount(reviewsWithProfiles.length);
      }

      // Check if user has already reviewed
      if (user) {
        const userReview = reviewsWithProfiles.find(r => r.user_id === user.id);
        setHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!user) return;

    try {
      // Check if user has a completed booking for this hall
      const { data: bookings } = await supabase
        .from("hall_bookings")
        .select("id")
        .eq("hall_id", hallId)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .limit(1);

      setCanReview(!!bookings && bookings.length > 0);
    } catch (error) {
      console.error("Error checking can review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإضافة تقييم",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("hall_reviews").insert({
        hall_id: hallId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "تم إضافة التقييم",
        description: "شكراً لمشاركة رأيك",
      });

      setShowAddReview(false);
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة التقييم",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, interactive = false, size = "w-5 h-5") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`${size} ${
                star <= value
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header with rating summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="text-lg font-bold text-foreground">{averageRating}</span>
          <span className="text-sm text-muted-foreground">({reviewsCount} تقييم)</span>
        </div>
        
        {user && canReview && !hasReviewed && (
          <Button
            size="sm"
            onClick={() => setShowAddReview(!showAddReview)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            أضف تقييم
          </Button>
        )}
      </div>

      {/* Add Review Form */}
      <AnimatePresence>
        {showAddReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/50 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground font-arabic">
                  تقييمك لـ {hallName}
                </label>
                {renderStars(rating, true, "w-8 h-8")}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground font-arabic">
                  اكتب تعليقك (اختياري)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="شاركنا تجربتك مع هذه القاعة..."
                  className="min-h-[100px] font-arabic"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "إرسال التقييم"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddReview(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted/30 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground font-arabic">
                      {review.profiles?.full_name || "مستخدم"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "d MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating, false, "w-4 h-4")}
              </div>
              
              {review.comment && (
                <p className="text-sm text-foreground/80 font-arabic leading-relaxed">
                  {review.comment}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground font-arabic">لا توجد تقييمات بعد</p>
          {canReview && !hasReviewed && (
            <p className="text-sm text-primary font-arabic mt-1">
              كن أول من يقيم هذه القاعة!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
