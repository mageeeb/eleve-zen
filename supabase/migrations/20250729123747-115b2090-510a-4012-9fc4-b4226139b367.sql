-- Modifier la fonction pour que tous les nouveaux utilisateurs soient admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Tous les nouveaux utilisateurs sont maintenant admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    'admin'::public.app_role
  );
  
  RETURN NEW;
END;
$function$