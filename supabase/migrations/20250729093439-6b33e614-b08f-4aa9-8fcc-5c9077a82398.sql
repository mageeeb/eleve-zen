-- Supprimer les anciennes contraintes check
ALTER TABLE public.eleves DROP CONSTRAINT IF EXISTS eleves_sexe_check;
ALTER TABLE public.eleves DROP CONSTRAINT IF EXISTS eleves_classe_check;

-- Recréer les contraintes avec les bonnes valeurs
ALTER TABLE public.eleves 
ADD CONSTRAINT eleves_sexe_check 
CHECK (sexe = ANY (ARRAY['Masculin'::text, 'Féminin'::text]));

ALTER TABLE public.eleves 
ADD CONSTRAINT eleves_classe_check 
CHECK (classe = ANY (ARRAY['Classe 1'::text, 'Classe 2'::text]));