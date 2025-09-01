-- Corriger la politique de suppression pour permettre aux admins de supprimer tous les élèves
DROP POLICY IF EXISTS "Only admins can delete students" ON public.eleves;

CREATE POLICY "Admins can delete any student" 
ON public.eleves 
FOR DELETE 
TO authenticated
USING (is_admin());

-- Même correction pour les notes et commentaires  
DROP POLICY IF EXISTS "Only admins can delete notes" ON public.notes;

CREATE POLICY "Admins can delete any note" 
ON public.notes 
FOR DELETE 
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.commentaires;

CREATE POLICY "Admins can delete any comment" 
ON public.commentaires 
FOR DELETE 
TO authenticated
USING (is_admin());