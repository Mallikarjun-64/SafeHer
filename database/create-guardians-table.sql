-- Create guardians table for SafeHer application
-- Run this in Supabase SQL Editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own guardians
CREATE POLICY "Users can view own guardians" ON guardians
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own guardians
CREATE POLICY "Users can insert own guardians" ON guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own guardians
CREATE POLICY "Users can update own guardians" ON guardians
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own guardians
CREATE POLICY "Users can delete own guardians" ON guardians
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS guardians_user_id_idx ON guardians(user_id);
CREATE INDEX IF NOT EXISTS guardians_email_idx ON guardians(email);

-- Grant permissions
GRANT ALL ON guardians TO authenticated;
GRANT SELECT ON guardians TO anon;
