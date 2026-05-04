-- SafeHer Complete Database Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- =============================================
-- 1. GUARDIANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  address TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  
  -- Alert preferences
  alerts_sos BOOLEAN DEFAULT true,
  alerts_location BOOLEAN DEFAULT true,
  alerts_checkin BOOLEAN DEFAULT true,
  alerts_emergency BOOLEAN DEFAULT true,
  
  -- Email verification
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_notified_at TIMESTAMP WITH TIME ZONE,
  total_notifications INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT guardians_email_user_unique UNIQUE (user_id, email),
  CONSTRAINT guardians_phone_user_unique UNIQUE (user_id, phone)
);

-- Create indexes for guardians table
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON public.guardians(email);
CREATE INDEX IF NOT EXISTS idx_guardians_status ON public.guardians(status);
CREATE INDEX IF NOT EXISTS idx_guardians_priority ON public.guardians(priority);
CREATE INDEX IF NOT EXISTS idx_guardians_verification_token ON public.guardians(verification_token);

-- =============================================
-- 2. EMERGENCY ALERTS TABLE
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

-- Create indexes for emergency alerts
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON public.emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_type ON public.emergency_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON public.emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON public.emergency_alerts(created_at);

-- =============================================
-- 3. NOTIFICATION LOGS TABLE
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

-- Create indexes for notification logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_alert_id ON public.notification_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_guardian_id ON public.notification_logs(guardian_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);

-- =============================================
-- 4. USER PROFILES TABLE
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

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- =============================================
-- 5. TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER set_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GUARDIANS table
CREATE POLICY "Users can view own guardians" ON public.guardians
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guardians" ON public.guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guardians" ON public.guardians
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own guardians" ON public.guardians
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for EMERGENCY ALERTS table
CREATE POLICY "Users can view own alerts" ON public.emergency_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON public.emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.emergency_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for NOTIFICATION LOGS table
CREATE POLICY "Users can view own notification logs" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.emergency_alerts ea 
      WHERE ea.id = alert_id AND ea.user_id = auth.uid()
    )
  );

-- RLS Policies for USER PROFILES table
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user's guardians with alert counts
CREATE OR REPLACE VIEW public.user_guardians_view AS
SELECT 
  g.*,
  COUNT(DISTINCT nl.id) as notification_count,
  MAX(nl.sent_at) as last_notification_at
FROM public.guardians g
LEFT JOIN public.notification_logs nl ON g.id = nl.guardian_id
WHERE g.user_id = auth.uid()
GROUP BY g.id;

-- View for user's emergency alerts
CREATE OR REPLACE VIEW public.user_alerts_view AS
SELECT 
  ea.*,
  COUNT(DISTINCT nl.id) as notification_sent_count,
  ARRAY_AGG(DISTINCT g.name) as notified_guardians
FROM public.emergency_alerts ea
LEFT JOIN public.notification_logs nl ON ea.id = nl.alert_id
LEFT JOIN public.guardians g ON nl.guardian_id = g.id
WHERE ea.user_id = auth.uid()
GROUP BY ea.id
ORDER BY ea.created_at DESC;

-- =============================================
-- 8. SAMPLE DATA (Optional - Uncomment to insert)
-- =============================================

/*
-- Sample guardian data (for testing)
INSERT INTO public.guardians (user_id, name, email, phone, relationship, priority) VALUES
('your-user-id-here', 'John Doe', 'john.doe@example.com', '+1234567890', 'Father', 'high'),
('your-user-id-here', 'Jane Smith', 'jane.smith@example.com', '+0987654321', 'Mother', 'high');

-- Sample user profile
INSERT INTO public.user_profiles (user_id, full_name, phone, blood_type) VALUES
('your-user-id-here', 'Test User', '+1122334455', 'O+');
*/

-- =============================================
-- 9. COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.guardians IS 'Emergency contacts/guardians for SafeHer users';
COMMENT ON TABLE public.emergency_alerts IS 'Emergency alerts triggered by users';
COMMENT ON TABLE public.notification_logs IS 'Log of all notifications sent to guardians';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';

COMMENT ON COLUMN public.guardians.verification_token IS 'Token for email verification (expires in 10 minutes)';
COMMENT ON COLUMN public.guardians.verification_expires_at IS 'When the verification token expires';
COMMENT ON COLUMN public.emergency_alerts.location_lat IS 'Latitude of emergency location';
COMMENT ON COLUMN public.emergency_alerts.location_lng IS 'Longitude of emergency location';
COMMENT ON COLUMN public.notification_logs.error_message IS 'Error details if notification failed';

-- =============================================
-- 10. COMPLETION MESSAGE
-- =============================================

-- Schema setup complete!
-- Tables: guardians, emergency_alerts, notification_logs, user_profiles
-- Features: RLS, triggers, indexes, views, constraints
-- Ready for SafeHer application usage
