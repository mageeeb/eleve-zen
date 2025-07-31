-- Corriger le problème de search_path pour la fonction generate_validation_code
CREATE OR REPLACE FUNCTION public.generate_validation_code()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT UPPER(LEFT(MD5(RANDOM()::TEXT), 6));
$$;