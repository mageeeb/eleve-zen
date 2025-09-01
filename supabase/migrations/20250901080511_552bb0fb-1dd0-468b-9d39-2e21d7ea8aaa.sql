-- Add CASCADE delete for related data when student is deleted
-- First, let's add foreign key constraints with CASCADE delete

-- For notes table
ALTER TABLE public.notes 
DROP CONSTRAINT IF EXISTS notes_eleve_id_fkey;

ALTER TABLE public.notes 
ADD CONSTRAINT notes_eleve_id_fkey 
FOREIGN KEY (eleve_id) REFERENCES public.eleves(id) 
ON DELETE CASCADE;

-- For commentaires table  
ALTER TABLE public.commentaires
DROP CONSTRAINT IF EXISTS commentaires_eleve_id_fkey;

ALTER TABLE public.commentaires
ADD CONSTRAINT commentaires_eleve_id_fkey 
FOREIGN KEY (eleve_id) REFERENCES public.eleves(id) 
ON DELETE CASCADE;