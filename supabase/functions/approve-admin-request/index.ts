import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== DEBUT approve-admin-request ===");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating Supabase client...");
    const supabase = createClient(
      "https://cfvuitpoiymeqblmlijy.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVpdHBvaXltZXFibG1saWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzc3NzMsImV4cCI6MjA2OTM1Mzc3M30._qSS6Nn5IfUgE2KxqUINJ8xJHGTfx6PhUjMqkJy34wI"
    );

    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body:", body);
    
    const requestId = body.requestId;
    if (!requestId) {
      console.error("No requestId provided");
      return new Response(JSON.stringify({ error: "requestId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Processing request ID:", requestId);

    // Générer code de validation
    const validationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    console.log("Generated validation code:", validationCode);
    console.log("Expires at:", expiresAt.toISOString());

    // Mettre à jour la demande
    console.log("Updating admin request...");
    const { data, error } = await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        validation_code: validationCode,
        code_expires_at: expiresAt.toISOString()
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Update successful:", data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Admin request approved',
      data: data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("=== ERREUR GENERALE ===", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);