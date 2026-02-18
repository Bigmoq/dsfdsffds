import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id, booking_type } = await req.json();

    if (!booking_id || !booking_type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing booking_id or booking_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moyasarSecretKey = Deno.env.get("MOYASAR_SECRET_KEY");
    if (!moyasarSecretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get booking and payment_id
    const table = booking_type === "hall" ? "hall_bookings" : "service_bookings";
    const { data: booking, error: fetchError } = await supabase
      .from(table)
      .select("payment_id, payment_status, amount")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (booking.payment_status !== "paid" || !booking.payment_id) {
      return new Response(
        JSON.stringify({ success: false, error: "No paid payment to refund" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Moyasar refund API
    const refundResponse = await fetch(
      `https://api.moyasar.com/v1/payments/${booking.payment_id}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(moyasarSecretKey + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: booking.amount }),
      }
    );

    if (!refundResponse.ok) {
      const errText = await refundResponse.text();
      console.error("Moyasar refund error:", errText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process refund" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const refundData = await refundResponse.json();

    // Update booking payment_status to refunded
    await supabase
      .from(table)
      .update({ payment_status: "refunded" })
      .eq("id", booking_id);

    return new Response(
      JSON.stringify({ success: true, refund_id: refundData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Refund error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
