-- Créer les politiques pour le bucket avatars
CREATE POLICY "Tout le monde peut voir les avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Les utilisateurs authentifiés peuvent télécharger leurs avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour leurs avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer leurs avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);