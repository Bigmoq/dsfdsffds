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
    const { payment_id, booking_id } = await req.json();

    if (!payment_id || !booking_id) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing payment_id or booking_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify payment with Moyasar API
    const moyasarSecretKey = Deno.env.get("MOYASAR_SECRET_KEY");
    if (!moyasarSecretKey) {
      console.error("MOYASAR_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ verified: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moyasarResponse = await fetch(
      `https://api.moyasar.com/v1/payments/${payment_id}`,
      {
        headers: {
          Authorization: `Basic ${btoa(moyasarSecretKey + ":")}`,
        },
      }
    );

    if (!moyasarResponse.ok) {
      const errText = await moyasarResponse.text();
      console.error("Moyasar API error:", errText);
      return new Response(
        JSON.stringify({ verified: false, error: "Failed to verify payment with Moyasar" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payment = await moyasarResponse.json();

    if (payment.status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, error: `Payment status: ${payment.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update booking in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try hall_bookings first
    const { data: hallBooking } = await supabase
      .from("hall_bookings")
      .update({
        payment_status: "paid",
        payment_id: payment_id,
        amount: payment.amount,
      })
      .eq("id", booking_id)
      .select()
      .maybeSingle();

    if (!hallBooking) {
      // Try service_bookings
      const { data: serviceBooking, error: serviceError } = await supabase
        .from("service_bookings")
        .update({
          payment_status: "paid",
          payment_id: payment_id,
          amount: payment.amount,
        })
        .eq("id", booking_id)
        .select()
        .maybeSingle();

      if (serviceError) {
        console.error("Error updating service booking:", serviceError);
        return new Response(
          JSON.stringify({ verified: false, error: "Failed to update booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ verified: true, payment_id: payment.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
