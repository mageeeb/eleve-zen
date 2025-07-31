-- Supprimer l'entrée 'user' en gardant seulement 'admin' pour cet utilisateur
DELETE FROM public.user_roles 
WHERE user_id = 'ac23bc59-b66f-420d-b90c-83332210e37c' 
  AND role = 'user';