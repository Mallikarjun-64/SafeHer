-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'police', 'guardian', 'user');

-- Alert status enum
CREATE TYPE public.alert_status AS ENUM ('pending', 'responded', 'in_progress', 'resolved', 'cancelled');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  medical_notes TEXT,
  blocked BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table — secure)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Guardians (trusted contacts of a user)
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relation TEXT,
  -- optional link to a guardian account (so they can see alerts)
  guardian_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Alerts (SOS)
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  message TEXT,
  status public.alert_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Alert updates / status log
CREATE TABLE public.alert_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.alert_status,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_updates ENABLE ROW LEVEL SECURITY;

-- Police stations
CREATE TABLE public.police_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;

-- Helplines
CREATE TABLE public.helplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER alerts_updated BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  desired_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'user'::public.app_role);
  -- Never let signup self-assign admin
  IF desired_role = 'admin' THEN
    desired_role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, desired_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RLS Policies =====

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'police'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admin update any profile" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- guardians
CREATE POLICY "User manage own guardians" ON public.guardians FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Linked guardian view" ON public.guardians FOR SELECT TO authenticated
  USING (guardian_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- alerts
CREATE POLICY "User insert own alerts" ON public.alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User view own alerts" ON public.alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "User update own alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Police view all alerts" ON public.alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'police') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Police update alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'police') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Guardian view linked alerts" ON public.alerts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guardians g WHERE g.user_id = alerts.user_id AND g.guardian_user_id = auth.uid()));

-- alert_updates
CREATE POLICY "View related alert updates" ON public.alert_updates FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.alerts a WHERE a.id = alert_updates.alert_id AND (
      a.user_id = auth.uid()
      OR public.has_role(auth.uid(), 'police')
      OR public.has_role(auth.uid(), 'admin')
      OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.user_id = a.user_id AND g.guardian_user_id = auth.uid())
    ))
  );
CREATE POLICY "Insert alert updates" ON public.alert_updates FOR INSERT TO authenticated
  WITH CHECK (
    updated_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.alerts a WHERE a.id = alert_updates.alert_id AND (
        a.user_id = auth.uid()
        OR public.has_role(auth.uid(), 'police')
        OR public.has_role(auth.uid(), 'admin')
        OR EXISTS (SELECT 1 FROM public.guardians g WHERE g.user_id = a.user_id AND g.guardian_user_id = auth.uid())
      )
    )
  );

-- police_stations / helplines (public read, admin write)
CREATE POLICY "Anyone view police stations" ON public.police_stations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage police stations" ON public.police_stations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone view helplines" ON public.helplines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage helplines" ON public.helplines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_updates;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.alert_updates REPLICA IDENTITY FULL;

-- Seed helplines
INSERT INTO public.helplines (name, phone, description) VALUES
('Women Helpline (India)', '1091', '24/7 women in distress helpline'),
('Police', '100', 'Emergency police'),
('Emergency Services', '112', 'All-in-one emergency number'),
('Domestic Abuse Helpline', '181', 'Women in distress / abuse');