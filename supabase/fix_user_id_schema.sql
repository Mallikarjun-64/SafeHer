-- Fix user_id column to use TEXT instead of UUID
-- This will allow both UUID and string user IDs

-- Drop existing guardians table and recreate with TEXT user_id
DROP TABLE IF EXISTS public.guardians CASCADE;

-- Recreate guardians table with TEXT user_id
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  relation VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON public.guardians(email);

-- Enable Row Level Security
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own guardians" ON public.guardians
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own guardians" ON public.guardians
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own guardians" ON public.guardians
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own guardians" ON public.guardians
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Schema fix complete!
