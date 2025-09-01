-- Add created_by field to commentaires table to track who created each comment
ALTER TABLE public.commentaires 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update existing comments to have the current user as created_by 
-- (we'll set this to null for now since we don't know who created existing comments)

-- Update RLS policy to include created_by in inserts
DROP POLICY IF EXISTS "Users can insert comments for students" ON public.commentaires;

CREATE POLICY "Users can insert comments for students" 
ON public.commentaires 
FOR INSERT 
WITH CHECK (created_by = auth.uid());