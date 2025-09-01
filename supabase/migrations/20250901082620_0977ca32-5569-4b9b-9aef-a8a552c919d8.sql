-- Activer la réplication pour les mises à jour temps réel
ALTER TABLE public.eleves REPLICA IDENTITY FULL;
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER TABLE public.commentaires REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.eleves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commentaires;