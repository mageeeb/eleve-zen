-- Fix conflicting RLS policies for commentaires table
-- Remove the conflicting admin-only insert policy since we want any authenticated user to be able to add comments
DROP POLICY IF EXISTS "Only admins can insert comments" ON public.commentaires;

-- Update the user insert policy to be more permissive - any authenticated user can insert
DROP POLICY IF EXISTS "Users can insert comments for students" ON public.commentaires;

CREATE POLICY "Authenticated users can insert comments" 
ON public.commentaires 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Also allow authenticated users to update their own comments
DROP POLICY IF EXISTS "Only admins can update comments" ON public.commentaires;

CREATE POLICY "Users can update their own comments" 
ON public.commentaires 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- And delete their own comments
DROP POLICY IF EXISTS "Only admins can delete comments" ON public.commentaires;

CREATE POLICY "Users can delete their own comments" 
ON public.commentaires 
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());