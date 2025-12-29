import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UseBookingNotificationsProps {
  hallIds: string[];
  onNewBooking?: () => void;
}

export function useBookingNotifications({ hallIds, onNewBooking }: UseBookingNotificationsProps) {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Only subscribe if user is a hall owner and has halls
    if (!user || role !== "hall_owner" || hallIds.length === 0) {
      return;
    }

    // Create realtime channel for booking notifications
    const channel = supabase
      .channel('hall-bookings-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hall_bookings',
        },
        async (payload) => {
          const newBooking = payload.new as any;
          
          // Check if this booking is for one of the owner's halls
          if (hallIds.includes(newBooking.hall_id)) {
            // Fetch hall name for the notification
            const { data: hall } = await supabase
              .from("halls")
              .select("name_ar")
              .eq("id", newBooking.hall_id)
              .maybeSingle();

            toast({
              title: "🔔 طلب حجز جديد",
              description: hall?.name_ar 
                ? `تم استلام طلب حجز جديد لقاعة ${hall.name_ar}`
                : "تم استلام طلب حجز جديد",
              duration: 8000,
            });

            // Trigger callback to refresh data
            onNewBooking?.();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, role, hallIds, toast, onNewBooking]);
}
