import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationCodeRequest {
  userEmail: string;
  userName: string;
  validationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Validation code function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, validationCode }: ValidationCodeRequest = await req.json();
    
    console.log("Sending validation code:", { userEmail, userName });

    const emailResponse = await resend.emails.send({
      from: "ÉlèveZen <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Code de validation administrateur - ÉlèveZen",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">ÉlèveZen</h1>
          <h2 style="color: #374151;">Votre demande d'administration a été approuvée !</h2>
          
          <p>Bonjour ${userName},</p>
          
          <p>Votre demande pour devenir administrateur sur ÉlèveZen a été approuvée. 
          Voici votre code de validation à saisir dans l'application :</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #10b981; font-size: 32px; margin: 0; letter-spacing: 4px; font-family: monospace;">
              ${validationCode}
            </h3>
          </div>
          
          <p><strong>Instructions :</strong></p>
          <ol>
            <li>Connectez-vous à votre compte ÉlèveZen</li>
            <li>Accédez à la section "Validation Administrateur"</li>
            <li>Saisissez le code ci-dessus</li>
            <li>Cliquez sur "Valider"</li>
          </ol>
          
          <p style="color: #dc2626; font-weight: bold;">
            ⚠️ Ce code expire dans 24 heures
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </div>
      `,
    });

    console.log("Validation code email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-validation-code function:", error);
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