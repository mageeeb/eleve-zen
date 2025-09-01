import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Utiliser la clé service role pour bypasser RLS
    console.log("🔌 Creating Supabase client with service role...");
    const supabase = createClient(
      "https://cfvuitpoiymeqblmlijy.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Code de validation simple
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log("💾 Updating request with code:", code);

    // Récupérer la demande d'abord pour avoir l'email
    const { data: requestData, error: fetchError } = await supabase
      .from('admin_requests')
      .select('email, user_id')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      console.error("❌ Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("📧 Request email:", requestData.email);

    // Mettre à jour la demande
    const { data, error } = await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        validation_code: code,
        code_expires_at: expires
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ Database update error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("✅ Database updated successfully:", data);

    // Envoyer l'email avec le code
    try {
      console.log("📬 Sending validation email...");
      const emailResponse = await resend.emails.send({
        from: "Admin <onboarding@resend.dev>",
        to: [requestData.email],
        subject: "Votre demande d'admin a été approuvée !",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Demande d'accès administrateur approuvée</h1>
            <p>Bonjour,</p>
            <p>Votre demande d'accès administrateur a été approuvée !</p>
            <p>Voici votre code de validation :</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h2 style="margin: 0; color: #2563eb; font-size: 32px; letter-spacing: 4px;">${code}</h2>
            </div>
            <p>Ce code expire le <strong>${new Date(expires).toLocaleString('fr-FR')}</strong>.</p>
            <p>Utilisez ce code dans l'application pour valider votre accès administrateur.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>
        `,
      });

      console.log("📧 Email sent successfully:", emailResponse);
    } catch (emailError: any) {
      console.error("📧 Email error (but approval succeeded):", emailError);
      // Continue même si l'email échoue
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Request approved and email sent',
      code: code,
      data: data
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