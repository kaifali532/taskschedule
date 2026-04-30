-- Supabase Database Startup SQL 
-- Copy and paste this into your Supabase SQL Editor to initialize your database.

-- 1. Create the Users table
-- We link this to auth.users so that Supabase Auth handles the secure login/passwords.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Member')) DEFAULT 'Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('To Do', 'In Progress', 'Done')) DEFAULT 'To Do',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies (Full Access for Development/Testing as requested)
CREATE POLICY "Allow all on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all on projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all on tasks" ON public.tasks FOR ALL USING (true);

-- 6. Automate Profile Creation on Signup
-- Ensures when a user signs up using Supabase Auth, they automatically get a row in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
     new.id,
     new.email,
     COALESCE(new.raw_user_meta_data->>'name', 'Unknown Member'),
     COALESCE(new.raw_user_meta_data->>'role', 'Member')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
