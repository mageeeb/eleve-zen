-- Enable RLS on all existing tables
ALTER TABLE public.eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

-- Create profiles table for authenticated users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Make the first user an admin, others are regular users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 
      THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin());

-- RLS Policies for eleves (students) - Admin only access
CREATE POLICY "Admins can view all students" 
ON public.eleves 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert students" 
ON public.eleves 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update students" 
ON public.eleves 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete students" 
ON public.eleves 
FOR DELETE 
USING (public.is_admin());

-- RLS Policies for notes - Admin only access
CREATE POLICY "Admins can view all notes" 
ON public.notes 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update notes" 
ON public.notes 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete notes" 
ON public.notes 
FOR DELETE 
USING (public.is_admin());

-- RLS Policies for commentaires - Admin only access
CREATE POLICY "Admins can view all comments" 
ON public.commentaires 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert comments" 
ON public.commentaires 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update comments" 
ON public.commentaires 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete comments" 
ON public.commentaires 
FOR DELETE 
USING (public.is_admin());

-- RLS Policies for matieres - Admin only access
CREATE POLICY "Admins can view all subjects" 
ON public.matieres 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert subjects" 
ON public.matieres 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subjects" 
ON public.matieres 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete subjects" 
ON public.matieres 
FOR DELETE 
USING (public.is_admin());

-- Drop the old admin table as it's no longer needed
DROP TABLE IF EXISTS public.admin;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();