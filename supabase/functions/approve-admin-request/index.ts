import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveRequestData {
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Approve admin request function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      "https://cfvuitpoiymeqblmlijy.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnVpdHBvaXltZXFibG1saWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzc3NzMsImV4cCI6MjA2OTM1Mzc3M30._qSS6Nn5IfUgE2KxqUINJ8xJHGTfx6PhUjMqkJy34wI",
      {
        auth: {
          storage: undefined,
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    const { requestId } = await req.json();
    
    console.log("Approving admin request:", requestId);

    // Générer un code de validation simple
    const validationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log("Generated validation code:", validationCode);

    // Mettre à jour la demande - version simple
    const { data: updateData, error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        validation_code: validationCode,
        code_expires_at: expiresAt.toISOString()
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ 
        error: `Failed to update admin request: ${updateError.message}` 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Admin request updated successfully:", updateData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Admin request approved',
      data: updateData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in approve-admin-request function:", error);
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