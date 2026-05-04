-- SafeHer Minimal Schema - Works with Existing Tables
-- Copy and paste this into Supabase SQL Editor

-- =============================================
-- 1. UPDATE EXISTING GUARDIANS TABLE
-- =============================================

-- Add missing columns to existing guardians table (run these one by one if needed)
-- Note: Some columns may already exist, ignore "column already exists" errors

ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS alerts_sos BOOLEAN DEFAULT true;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS alerts_location BOOLEAN DEFAULT true;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS alerts_checkin BOOLEAN DEFAULT true;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS alerts_emergency BOOLEAN DEFAULT true;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- =============================================
-- 2. EMERGENCY ALERTS TABLE (NEW)
-- =============================================
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('sos', 'test', 'checkin_missed', 'emergency')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  guardian_notified_count INTEGER DEFAULT 0
);

-- =============================================
-- 3. NOTIFICATION LOGS TABLE (NEW)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('email', 'sms', 'push')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  message TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 4. USER PROFILES TABLE (NEW)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  medical_conditions TEXT,
  allergies TEXT,
  blood_type VARCHAR(10),
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- 5. INDEXES
-- =============================================

-- Guardians table indexes
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON public.guardians(email);
CREATE INDEX IF NOT EXISTS idx_guardians_verification_token ON public.guardians(verification_token);

-- Emergency alerts indexes
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON public.emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_type ON public.emergency_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON public.emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON public.emergency_alerts(created_at);

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_alert_id ON public.notification_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_guardian_id ON public.notification_logs(guardian_id);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- =============================================
-- 6. TRIGGERS
-- =============================================

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_guardians_updated_at ON public.guardians;
CREATE TRIGGER set_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 7. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own guardians" ON public.guardians;
DROP POLICY IF EXISTS "Users can insert own guardians" ON public.guardians;
DROP POLICY IF EXISTS "Users can update own guardians" ON public.guardians;
DROP POLICY IF EXISTS "Users can delete own guardians" ON public.guardians;

-- RLS Policies for GUARDIANS table
CREATE POLICY "Users can view own guardians" ON public.guardians
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guardians" ON public.guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guardians" ON public.guardians
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own guardians" ON public.guardians
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for other tables
CREATE POLICY "Users can view own alerts" ON public.emergency_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON public.emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notification logs" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.emergency_alerts ea 
      WHERE ea.id = alert_id AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 8. COMPLETION
-- =============================================

-- Minimal schema setup complete!
-- This script updates your existing guardians table and adds the new tables needed.
