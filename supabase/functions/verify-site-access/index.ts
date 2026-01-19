import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const validPassword = Deno.env.get("SITE_ACCESS_PASSWORD");

    // Remove RTL/LTR marks and trim whitespace
    // Unicode: \u200F (RTL mark), \u200E (LTR mark), \u202B (RTL embedding), \u202A (LTR embedding)
    const cleanInput = (password || "").replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069]/g, '').trim();
    const cleanValid = (validPassword || "").replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069]/g, '').trim();

    console.log("Site access verification attempt");
    console.log("Input password length:", cleanInput.length);
    console.log("Valid password length:", cleanValid.length);

    if (!validPassword) {
      console.error("SITE_ACCESS_PASSWORD not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Password not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (cleanInput === cleanValid) {
      console.log("Site access granted");
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Site access denied - invalid password");
    console.log("Expected:", cleanValid.substring(0, 3) + "***");
    console.log("Got:", cleanInput.substring(0, 3) + "***");
    return new Response(
      JSON.stringify({ success: false, error: "Invalid password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-site-access:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
