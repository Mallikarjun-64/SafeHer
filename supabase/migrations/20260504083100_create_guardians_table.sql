-- Create guardians table for SafeHer emergency contacts
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
  
  -- Verification status
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_notified_at TIMESTAMP WITH TIME ZONE,
  notification_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT guardians_email_user_unique UNIQUE (user_id, email),
  CONSTRAINT guardians_phone_user_unique UNIQUE (user_id, phone)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON public.guardians(email);
CREATE INDEX IF NOT EXISTS idx_guardians_status ON public.guardians(status);
CREATE INDEX IF NOT EXISTS idx_guardians_priority ON public.guardians(priority);
CREATE INDEX IF NOT EXISTS idx_guardians_verification_token ON public.guardians(verification_token);

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own guardians
CREATE POLICY "Users can view own guardians"
  ON public.guardians FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own guardians
CREATE POLICY "Users can insert own guardians"
  ON public.guardians FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own guardians
CREATE POLICY "Users can update own guardians"
  ON public.guardians FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own guardians
CREATE POLICY "Users can delete own guardians"
  ON public.guardians FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE public.guardians IS 'Emergency contacts/guardians for SafeHer users';
COMMENT ON COLUMN public.guardians.user_id IS 'Reference to the user who owns this guardian';
COMMENT ON COLUMN public.guardians.name IS 'Full name of the guardian';
COMMENT ON COLUMN public.guardians.email IS 'Email address for notifications';
COMMENT ON COLUMN public.guardians.phone IS 'Phone number for SMS/calls';
COMMENT ON COLUMN public.guardians.relationship IS 'Relationship to the user (e.g., Mother, Father, Friend)';
COMMENT ON COLUMN public.guardians.status IS 'Current status of the guardian';
COMMENT ON COLUMN public.guardians.priority IS 'Priority level for notifications';
COMMENT ON COLUMN public.guardians.alerts_sos IS 'Whether guardian receives SOS alerts';
COMMENT ON COLUMN public.guardians.alerts_location IS 'Whether guardian receives location updates';
COMMENT ON COLUMN public.guardians.alerts_checkin IS 'Whether guardian receives check-in reminders';
COMMENT ON COLUMN public.guardians.alerts_emergency IS 'Whether guardian receives emergency updates';
COMMENT ON COLUMN public.guardians.email_verified IS 'Whether the guardian email has been verified';
COMMENT ON COLUMN public.guardians.verification_token IS 'Token for email verification';
COMMENT ON COLUMN public.guardians.verification_expires_at IS 'When the verification token expires';
COMMENT ON COLUMN public.guardians.added_at IS 'When the guardian was added';
COMMENT ON COLUMN public.guardians.updated_at IS 'When the guardian was last updated';
COMMENT ON COLUMN public.guardians.last_notified_at IS 'When the guardian was last notified';
COMMENT ON COLUMN public.guardians.notification_count IS 'Total number of notifications sent to this guardian';
