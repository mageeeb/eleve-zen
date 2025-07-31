-- Créer une table pour les demandes d'admin en attente
CREATE TABLE public.admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  validation_code TEXT,
  code_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS sur admin_requests
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Policies pour admin_requests
CREATE POLICY "Users can view their own admin request" 
ON public.admin_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own admin request" 
ON public.admin_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can view all requests" 
ON public.admin_requests 
FOR SELECT 
USING (auth.email() = 'nanouchkaly@yahoo.fr');

CREATE POLICY "Super admin can update all requests" 
ON public.admin_requests 
FOR UPDATE 
USING (auth.email() = 'nanouchkaly@yahoo.fr');

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Modifier les policies existantes pour être plus restrictives
-- D'abord, supprimer les anciennes policies sur les tables principales

-- Table eleves - nouvelles policies plus restrictives
DROP POLICY IF EXISTS "Admins can view their own students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can insert their own students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can update their own students" ON public.eleves;
DROP POLICY IF EXISTS "Admins can delete their own students" ON public.eleves;

CREATE POLICY "Authenticated users can view students" 
ON public.eleves 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert students" 
ON public.eleves 
FOR INSERT 
WITH CHECK (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Only admins can update students" 
ON public.eleves 
FOR UPDATE 
USING (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Only admins can delete students" 
ON public.eleves 
FOR DELETE 
USING (is_admin() AND auth.uid() = user_id);

-- Table notes - nouvelles policies
DROP POLICY IF EXISTS "Admins can view notes for their students" ON public.notes;
DROP POLICY IF EXISTS "Admins can insert notes for their students" ON public.notes;
DROP POLICY IF EXISTS "Admins can update notes for their students" ON public.notes;
DROP POLICY IF EXISTS "Admins can delete notes for their students" ON public.notes;

CREATE POLICY "Authenticated users can view notes" 
ON public.notes 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = notes.eleve_id AND eleves.user_id = auth.uid())));

CREATE POLICY "Only admins can update notes" 
ON public.notes 
FOR UPDATE 
USING (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = notes.eleve_id AND eleves.user_id = auth.uid())));

CREATE POLICY "Only admins can delete notes" 
ON public.notes 
FOR DELETE 
USING (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = notes.eleve_id AND eleves.user_id = auth.uid())));

-- Table commentaires - nouvelles policies
DROP POLICY IF EXISTS "Admins can view comments for their students" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can insert comments for their students" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can update comments for their students" ON public.commentaires;
DROP POLICY IF EXISTS "Admins can delete comments for their students" ON public.commentaires;

CREATE POLICY "Authenticated users can view comments" 
ON public.commentaires 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert comments" 
ON public.commentaires 
FOR INSERT 
WITH CHECK (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = commentaires.eleve_id AND eleves.user_id = auth.uid())));

CREATE POLICY "Only admins can update comments" 
ON public.commentaires 
FOR UPDATE 
USING (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = commentaires.eleve_id AND eleves.user_id = auth.uid())));

CREATE POLICY "Only admins can delete comments" 
ON public.commentaires 
FOR DELETE 
USING (is_admin() AND (EXISTS ( SELECT 1 FROM eleves WHERE eleves.id = commentaires.eleve_id AND eleves.user_id = auth.uid())));

-- Fonction pour générer un code aléatoire
CREATE OR REPLACE FUNCTION public.generate_validation_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT UPPER(LEFT(MD5(RANDOM()::TEXT), 6));
$$;