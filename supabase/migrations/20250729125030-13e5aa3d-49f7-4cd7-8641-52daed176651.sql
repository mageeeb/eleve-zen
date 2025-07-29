-- Donner le rôle admin à l'utilisateur le plus récent
UPDATE public.user_roles 
SET role = 'admin'::public.app_role 
WHERE user_id = (
  SELECT id FROM public.profiles 
  WHERE email = 'nounagejohnson@gmail.com'
);

-- Vérifier que la fonction handle_new_user est bien appliquée
-- (La fonction a été mise à jour mais il semble qu'elle n'ait pas fonctionné pour ce dernier utilisateur)