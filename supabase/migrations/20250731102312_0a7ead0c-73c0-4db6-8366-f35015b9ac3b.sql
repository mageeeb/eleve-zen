-- Créer la fonction pour générer un code de validation
CREATE OR REPLACE FUNCTION public.generate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT UPPER(LEFT(MD5(RANDOM()::TEXT), 6));
$$;