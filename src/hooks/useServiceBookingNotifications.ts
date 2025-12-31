import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UseServiceBookingNotificationsProps {
  providerIds: string[];
  onNewBooking?: () => void;
}

export function useServiceBookingNotifications({ providerIds, onNewBooking }: UseServiceBookingNotificationsProps) {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Only subscribe if user is a service provider and has providers
    if (!user || role !== "service_provider" || providerIds.length === 0) {
      return;
    }

    // Create realtime channel for booking notifications
    const channel = supabase
      .channel('service-bookings-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_bookings',
        },
        async (payload) => {
          const newBooking = payload.new as any;
          
          // Check if this booking is for one of the owner's service providers
          if (providerIds.includes(newBooking.provider_id)) {
            // Fetch provider name for the notification
            const { data: provider } = await supabase
              .from("service_providers")
              .select("name_ar")
              .eq("id", newBooking.provider_id)
              .maybeSingle();

            toast({
              title: "🔔 طلب حجز جديد",
              description: provider?.name_ar 
                ? `تم استلام طلب حجز جديد لخدمة ${provider.name_ar}`
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
  }, [user, role, providerIds, toast, onNewBooking]);
}
