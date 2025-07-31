import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminRequestNotification {
  userEmail: string;
  userName: string;
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, requestId }: AdminRequestNotification = await req.json();
    
    console.log("Sending notification for admin request:", { userEmail, userName, requestId });

    const emailResponse = await resend.emails.send({
      from: "ÉlèveZen <onboarding@resend.dev>",
      to: ["nanouchkaly@gmail.com"],
      subject: "Nouvelle demande d'administration - ÉlèveZen",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">ÉlèveZen</h1>
          <h2 style="color: #374151;">Nouvelle demande d'administration</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom d'utilisateur :</strong> ${userName}</p>
            <p><strong>Email :</strong> ${userEmail}</p>
            <p><strong>ID de la demande :</strong> ${requestId}</p>
          </div>
          
          <p>Un utilisateur souhaite obtenir les droits d'administration sur ÉlèveZen.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cfvuitpoiymeqblmlijy.supabase.co/dashboard/project/cfvuitpoiymeqblmlijy" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Gérer les demandes dans Supabase
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Connectez-vous à votre tableau de bord Supabase pour approuver ou rejeter cette demande.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
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