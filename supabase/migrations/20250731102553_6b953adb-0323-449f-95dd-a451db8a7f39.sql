-- Corriger la fonction avec des noms de variables différents
CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_validation_code text;
  v_expires_at timestamp with time zone;
  request_record record;
BEGIN
  -- Générer un code de validation directement
  v_validation_code := UPPER(LEFT(MD5(RANDOM()::TEXT), 6));
  
  -- Définir l'expiration à 24h
  v_expires_at := now() + interval '24 hours';
  
  -- Mettre à jour la demande
  UPDATE public.admin_requests 
  SET 
    status = 'approved',
    validation_code = v_validation_code,
    code_expires_at = v_expires_at,
    updated_at = now()
  WHERE id = request_id
  RETURNING * INTO request_record;
  
  -- Retourner les informations
  RETURN json_build_object(
    'success', true,
    'validation_code', v_validation_code,
    'expires_at', v_expires_at,
    'request', request_record
  );
END;
$$;