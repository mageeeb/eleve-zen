-- Ajouter le champ user_id à la table eleves pour lier chaque élève à son admin
ALTER TABLE public.eleves 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ajouter le champ formation au profil utilisateur
ALTER TABLE public.profiles 
ADD COLUMN formation text;

-- Assigner tous les élèves existants à l'admin actuel
UPDATE public.eleves 
SET user_id = (SELECT id FROM public.profiles WHERE email = 'nounagejohnson@gmail.com');

-- Rendre user_id obligatoire pour les nouveaux élèves
ALTER TABLE public.eleves 
ALTER COLUMN user_id SET NOT NULL;

-- Mettre à jour les politiques RLS pour les élèves - chaque admin ne voit que ses propres élèves
DROP POLICY IF EXISTS "Admins can view all students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can insert students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can update students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can delete students" ON public.eleves;

CREATE POLICY "Admins can view their own students" 
ON public.eleves 
FOR SELECT 
USING (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can insert their own students" 
ON public.eleves 
FOR INSERT 
WITH CHECK (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can update their own students" 
ON public.eleves 
FOR UPDATE 
USING (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can delete their own students" 
ON public.eleves 
FOR DELETE 
USING (is_admin() AND auth.uid() = user_id);

-- Mettre à jour les politiques RLS pour les commentaires - liés aux élèves de l'admin
DROP POLICY IF EXISTS "Admins can view all comments" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can insert comments" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can update comments" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.commentaires;

CREATE POLICY "Admins can view comments for their students" 
ON public.commentaires 
FOR SELECT 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = commentaires.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can insert comments for their students" 
ON public.commentaires 
FOR INSERT 
WITH CHECK (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = commentaires.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can update comments for their students" 
ON public.commentaires 
FOR UPDATE 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = commentaires.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can delete comments for their students" 
ON public.commentaires 
FOR DELETE 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = commentaires.eleve_id 
  AND eleves.user_id = auth.uid()
));

-- Mettre à jour les politiques RLS pour les notes - liées aux élèves de l'admin
DROP POLICY IF EXISTS "Admins can view all notes" ON public.notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON public.notes;
DROP POLICY IF EXISTS "Admins can update notes" ON public.notes;
DROP POLICY IF EXISTS "Admins can delete notes" ON public.notes;

CREATE POLICY "Admins can view notes for their students" 
ON public.notes 
FOR SELECT 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = notes.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can insert notes for their students" 
ON public.notes 
FOR INSERT 
WITH CHECK (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = notes.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can update notes for their students" 
ON public.notes 
FOR UPDATE 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = notes.eleve_id 
  AND eleves.user_id = auth.uid()
));

CREATE POLICY "Admins can delete notes for their students" 
ON public.notes 
FOR DELETE 
USING (is_admin() AND EXISTS (
  SELECT 1 FROM public.eleves 
  WHERE eleves.id = notes.eleve_id 
  AND eleves.user_id = auth.uid()
));

-- Modifier la fonction handle_new_user pour ne plus donner automatiquement le rôle admin
-- Les nouveaux utilisateurs auront le rôle 'user' par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Les nouveaux utilisateurs ont le rôle 'user' par défaut
  -- Un admin existant pourra leur donner le rôle 'admin' si nécessaire
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    'user'::public.app_role
  );
  
  RETURN NEW;
END;
$$;