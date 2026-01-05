import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoStr = oneDayAgo.toISOString().split('T')[0];

    console.log("Checking for completed service bookings on:", oneDayAgoStr);

    // Get completed service bookings from 1 day ago that haven't been reviewed
    const { data: serviceBookings, error: serviceError } = await supabase
      .from("service_bookings")
      .select(`
        id,
        user_id,
        provider_id,
        service_providers (name_ar)
      `)
      .eq("status", "completed")
      .gte("updated_at", oneDayAgoStr + "T00:00:00")
      .lt("updated_at", oneDayAgoStr + "T23:59:59");

    if (serviceError) {
      console.error("Error fetching service bookings:", serviceError);
      throw serviceError;
    }

    console.log("Found service bookings:", serviceBookings?.length || 0);

    // Check which bookings don't have reviews yet
    const serviceNotifications = [];
    for (const booking of serviceBookings || []) {
      const { data: existingReview } = await supabase
        .from("service_provider_reviews")
        .select("id")
        .eq("user_id", booking.user_id)
        .eq("provider_id", booking.provider_id)
        .single();

      if (!existingReview) {
        // Check if we already sent a reminder
        const { data: existingNotification } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", booking.user_id)
          .eq("reference_type", "review_reminder")
          .eq("reference_id", booking.id)
          .single();

        if (!existingNotification) {
          const provider = booking.service_providers as any;
          const providerName = provider?.name_ar || "مقدم الخدمة";
          serviceNotifications.push({
            user_id: booking.user_id,
            title: "شاركنا رأيك! ⭐",
            message: `كيف كانت تجربتك مع ${providerName}؟ قيّم الخدمة لمساعدة الآخرين`,
            type: "info",
            reference_type: "review_reminder",
            reference_id: booking.id,
          });
        }
      }
    }

    // Get accepted hall bookings from 1 day ago
    const { data: hallBookings, error: hallError } = await supabase
      .from("hall_bookings")
      .select(`
        id,
        user_id,
        hall_id,
        halls (name_ar)
      `)
      .eq("status", "accepted")
      .gte("booking_date", oneDayAgoStr)
      .lt("booking_date", oneDayAgoStr);

    if (hallError) {
      console.error("Error fetching hall bookings:", hallError);
    }

    console.log("Found hall bookings:", hallBookings?.length || 0);

    const hallNotifications = [];
    for (const booking of hallBookings || []) {
      const { data: existingReview } = await supabase
        .from("hall_reviews")
        .select("id")
        .eq("user_id", booking.user_id)
        .eq("hall_id", booking.hall_id)
        .single();

      if (!existingReview) {
        const { data: existingNotification } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", booking.user_id)
          .eq("reference_type", "hall_review_reminder")
          .eq("reference_id", booking.id)
          .single();

        if (!existingNotification) {
          const hall = booking.halls as any;
          const hallName = hall?.name_ar || "القاعة";
          hallNotifications.push({
            user_id: booking.user_id,
            title: "كيف كانت تجربتك؟ ⭐",
            message: `شاركنا رأيك في ${hallName} لمساعدة العرسان الآخرين`,
            type: "info",
            reference_type: "hall_review_reminder",
            reference_id: booking.id,
          });
        }
      }
    }

    // Insert all notifications
    const allNotifications = [...serviceNotifications, ...hallNotifications];
    
    if (allNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(allNotifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
      console.log("Inserted notifications:", allNotifications.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        serviceReminders: serviceNotifications.length,
        hallReminders: hallNotifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-review-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
