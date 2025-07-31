-- Créer une politique qui permet aux utilisateurs de devenir admin s'ils ont un code de validation valide
CREATE POLICY "Users can become admin with valid validation code" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin'::public.app_role
  AND EXISTS (
    SELECT 1 
    FROM public.admin_requests 
    WHERE user_id = auth.uid() 
      AND status = 'approved' 
      AND validation_code IS NOT NULL 
      AND code_expires_at > now()
  )
);

-- Ajouter une politique pour permettre la mise à jour vers admin avec code valide
CREATE POLICY "Users can update to admin with valid validation code" 
ON public.user_roles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 
    FROM public.admin_requests 
    WHERE user_id = auth.uid() 
      AND status = 'approved' 
      AND validation_code IS NOT NULL 
      AND code_expires_at > now()
  )
)
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin'::public.app_role
  AND EXISTS (
    SELECT 1 
    FROM public.admin_requests 
    WHERE user_id = auth.uid() 
      AND status = 'approved' 
      AND validation_code IS NOT NULL 
      AND code_expires_at > now()
  )
);