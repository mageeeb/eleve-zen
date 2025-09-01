-- Ajouter une colonne matiere à la table commentaires pour permettre des commentaires par matière
ALTER TABLE public.commentaires 
ADD COLUMN matiere text;

-- Créer un index pour optimiser les requêtes par matière
CREATE INDEX idx_commentaires_matiere_eleve ON public.commentaires(eleve_id, matiere);

-- Mettre à jour les politiques RLS pour inclure la nouvelle colonne matiere
DROP POLICY IF EXISTS "Only admins can insert comments" ON public.commentaires;
DROP POLICY IF EXISTS "Only admins can update comments" ON public.commentaires;
DROP POLICY IF EXISTS "Only admins can delete comments" ON public.commentaires;

CREATE POLICY "Only admins can insert comments" 
ON public.commentaires 
FOR INSERT 
WITH CHECK (is_admin() AND (EXISTS ( SELECT 1
 FROM eleves
WHERE ((eleves.id = commentaires.eleve_id) AND (eleves.user_id = auth.uid())))));

CREATE POLICY "Only admins can update comments" 
ON public.commentaires 
FOR UPDATE 
USING (is_admin() AND (EXISTS ( SELECT 1
 FROM eleves
WHERE ((eleves.id = commentaires.eleve_id) AND (eleves.user_id = auth.uid())))));

CREATE POLICY "Only admins can delete comments" 
ON public.commentaires 
FOR DELETE 
USING (is_admin() AND (EXISTS ( SELECT 1
 FROM eleves
WHERE ((eleves.id = commentaires.eleve_id) AND (eleves.user_id = auth.uid())))));