-- Créer la fonction d'approbation d'admin
CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  validation_code text;
  expires_at timestamp with time zone;
  request_record record;
BEGIN
  -- Générer un code de validation
  SELECT generate_validation_code() INTO validation_code;
  
  -- Définir l'expiration à 24h
  expires_at := now() + interval '24 hours';
  
  -- Mettre à jour la demande
  UPDATE public.admin_requests 
  SET 
    status = 'approved',
    validation_code = validation_code,
    code_expires_at = expires_at,
    updated_at = now()
  WHERE id = request_id
  RETURNING * INTO request_record;
  
  -- Retourner les informations
  RETURN json_build_object(
    'success', true,
    'validation_code', validation_code,
    'expires_at', expires_at,
    'request', request_record
  );
END;
$$;