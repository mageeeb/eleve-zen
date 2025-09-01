import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("🚀 Function called:", req.method);

  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("📥 Parsing body...");
    const { requestId } = await req.json();
    console.log("📋 RequestId:", requestId);

    if (!requestId) {
      console.log("❌ Missing requestId");
      return new Response(JSON.stringify({ error: "requestId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("🔌 Creating Supabase client...");
    const supabase = createClient(
      "https://cfvuitpoiymeqblmlijy.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVpdHBvaXltZXFibG1saWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzc3NzMsImV4cCI6MjA2OTM1Mzc3M30._qSS6Nn5IfUgE2KxqUINJ8xJHGTfx6PhUjMqkJy34wI"
    );

    // Code de validation simple
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log("💾 Updating request with code:", code);

    const { data, error } = await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        validation_code: code,
        code_expires_at: expires
      })
      .eq('id', requestId);

    if (error) {
      console.error("❌ Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("✅ Success!");
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Request approved',
      code: code
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("💥 Catch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});