import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, Edit2, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddVendorReviewSheet } from "./AddVendorReviewSheet";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface VendorReviewsProps {
  providerId: string;
  providerName: string;
}

export function VendorReviews({ providerId, providerName }: VendorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('service_provider_reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then fetch profiles for each review
      if (reviewsData && reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const reviewsWithProfiles = reviewsData.map(review => ({
          ...review,
          profiles: profilesMap.get(review.user_id) || null,
        }));

        setReviews(reviewsWithProfiles as Review[]);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a confirmed/completed booking for this provider
  const checkCanReview = async () => {
    if (!user) {
      setCanReview(false);
      return;
    }

    try {
      const { data: bookings } = await supabase
        .from("service_bookings")
        .select("id")
        .eq("provider_id", providerId)
        .eq("user_id", user.id)
        .in("status", ["confirmed", "completed"])
        .limit(1);

      setCanReview(!!bookings && bookings.length > 0);
    } catch (error) {
      console.error("Error checking can review:", error);
      setCanReview(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [providerId]);

  useEffect(() => {
    if (user) {
      checkCanReview();
    } else {
      setCanReview(false);
    }
  }, [providerId, user]);

  const userReview = reviews.find(r => r.user_id === user?.id);

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;

    try {
      const { error } = await supabase
        .from('service_provider_reviews')
        .delete()
        .eq('id', deletingReviewId);

      if (error) throw error;

      toast({
        title: "تم حذف التقييم",
        description: "تم حذف تقييمك بنجاح",
      });

      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "حدث خطأ",
        description: "تعذر حذف التقييم",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="text-right">
      <div className="flex items-center justify-between mb-4">
        {/* Only show add review button if user has a confirmed/completed booking */}
        {user && canReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (userReview) {
                setEditingReview(userReview);
              }
              setShowAddReview(true);
            }}
          >
            <MessageSquare className="w-4 h-4 ml-1" />
            {userReview ? "تعديل تقييمي" : "أضف تقييم"}
          </Button>
        )}
        {/* Show empty div to keep flex layout when button is hidden */}
        {(!user || !canReview) && <div />}
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground font-arabic">التقييمات والمراجعات</h3>
          <Star className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Rating Summary */}
      <div className="card-luxe rounded-xl p-4 mb-4">
        <div className="flex gap-6 items-center">
          {/* Rating Bars */}
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ rating, percentage }) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: rating * 0.1 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <span className="w-3 text-muted-foreground">{rating}</span>
              </div>
            ))}
          </div>

          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">
              {averageRating}
            </div>
            <div className="flex justify-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(averageRating))
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {reviews.length} تقييم
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          جاري تحميل التقييمات...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-arabic mb-2">
            لا توجد تقييمات بعد
          </p>
          <p className="text-sm text-muted-foreground">
            كن أول من يقيم هذه الخدمة
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="card-luxe rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-sm text-foreground">
                        {review.profiles?.full_name || "مستخدم"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), 'd MMM yyyy', { locale: ar })}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {review.profiles?.avatar_url ? (
                        <img 
                          src={review.profiles.avatar_url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Actions for user's own review */}
                {review.user_id === user?.id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingReview(review);
                        setShowAddReview(true);
                      }}
                      className="text-xs"
                    >
                      <Edit2 className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingReviewId(review.id)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 ml-1" />
                      حذف
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Review Sheet */}
      <AddVendorReviewSheet
        open={showAddReview}
        onOpenChange={(open) => {
          setShowAddReview(open);
          if (!open) setEditingReview(null);
        }}
        providerId={providerId}
        providerName={providerName}
        existingReview={editingReview ? {
          id: editingReview.id,
          rating: editingReview.rating,
          comment: editingReview.comment,
        } : null}
        onSuccess={fetchReviews}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right font-arabic">
              حذف التقييم
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right font-arabic">
              هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info message for users */}
      {!user && (
        <p className="text-center text-sm text-muted-foreground mt-4 font-arabic">
          سجل دخولك لإضافة تقييم
        </p>
      )}
      {user && !canReview && !userReview && (
        <p className="text-center text-sm text-muted-foreground mt-4 font-arabic">
          يمكنك التقييم بعد اكتمال حجزك مع مقدم الخدمة
        </p>
      )}
    </div>
  );
}