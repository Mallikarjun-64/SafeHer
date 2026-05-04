import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface EmergencyAlert {
  id?: string;
  user_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
  resolved_at?: string;
  guardian_notifications_sent: boolean;
  emergency_services_notified: boolean;
}

export interface Guardian {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  is_active: boolean;
  created_at: string;
}

export interface GuardianNotification {
  id?: string;
  emergency_alert_id: string;
  guardian_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at: string;
  delivery_method: 'sms' | 'email' | 'push';
  error_message?: string;
}

export interface UserLocation {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  timestamp: string;
}
