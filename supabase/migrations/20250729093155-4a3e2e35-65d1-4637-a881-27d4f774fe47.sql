-- Mettre à jour le rôle de l'utilisateur pour qu'il devienne admin
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id = 'ba6f51e0-3a60-4d9e-a8ab-379468523a5d';