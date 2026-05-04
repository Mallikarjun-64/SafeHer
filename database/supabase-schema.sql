-- Supabase SQL Schema for SOS Emergency System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (if not already exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardians table
CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  relationship VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- 1 = highest priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'resolved', 'cancelled')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  accuracy DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  guardian_notifications_sent BOOLEAN DEFAULT false,
  emergency_services_notified BOOLEAN DEFAULT false,
  notes TEXT
);

-- Guardian notifications table
CREATE TABLE IF NOT EXISTS guardian_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  emergency_alert_id UUID REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_method VARCHAR(10) CHECK (delivery_method IN ('sms', 'email', 'push')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- User locations table (for tracking location history)
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  accuracy DECIMAL(8, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency services contacts table
CREATE TABLE IF NOT EXISTS emergency_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country VARCHAR(2) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('police', 'medical', 'fire', 'general')),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_active ON guardians(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_guardian_notifications_alert_id ON guardian_notifications(emergency_alert_id);
CREATE INDEX IF NOT EXISTS idx_guardian_notifications_guardian_id ON guardian_notifications(guardian_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON user_locations(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for guardians
CREATE POLICY "Users can view their own guardians" ON guardians
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guardians" ON guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guardians" ON guardians
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guardians" ON guardians
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for emergency alerts
CREATE POLICY "Users can view their own emergency alerts" ON emergency_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency alerts" ON emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency alerts" ON emergency_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for guardian notifications
CREATE POLICY "Users can view notifications for their alerts" ON guardian_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM emergency_alerts 
      WHERE emergency_alerts.id = guardian_notifications.emergency_alert_id 
      AND emergency_alerts.user_id = auth.uid()
    )
  );

-- RLS policies for user locations
CREATE POLICY "Users can view their own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON guardians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default emergency services
INSERT INTO emergency_services (country, service_name, phone_number, service_type) VALUES
('US', 'Police', '911', 'general'),
('US', 'Emergency Medical Services', '911', 'medical'),
('US', 'Fire Department', '911', 'fire'),
('UK', 'Police', '999', 'general'),
('UK', 'Emergency Medical Services', '999', 'medical'),
('UK', 'Fire Department', '999', 'fire'),
('IN', 'Police', '112', 'general'),
('IN', 'Emergency Medical Services', '108', 'medical'),
('IN', 'Fire Department', '101', 'fire')
ON CONFLICT (country, service_name, service_type) DO NOTHING;
