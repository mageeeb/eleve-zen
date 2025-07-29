-- Modifier les politiques storage pour permettre l'upload sans authentification pendant l'inscription
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent télécharger leurs avatars" ON storage.objects;

-- Nouvelle politique plus permissive pour l'inscription 
CREATE POLICY "Utilisateurs peuvent télécharger avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');