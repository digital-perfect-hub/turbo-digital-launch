BEGIN;

CREATE TABLE IF NOT EXISTS public.site_modules (
  site_id uuid PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
  has_forum boolean NOT NULL DEFAULT false,
  has_shop boolean NOT NULL DEFAULT false,
  has_seo_pro boolean NOT NULL DEFAULT false,
  has_support_desk boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_modules ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_site_modules_updated_at ON public.site_modules;
CREATE TRIGGER update_site_modules_updated_at
BEFORE UPDATE ON public.site_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_modules (site_id, has_forum, has_shop, has_seo_pro, has_support_desk)
SELECT s.id, true, true, true, false
FROM public.sites s
ON CONFLICT (site_id) DO NOTHING;

ALTER TABLE public.site_modules
  ADD COLUMN IF NOT EXISTS has_support_desk boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_modules' AND policyname = 'Site managers can read site modules'
  ) THEN
    CREATE POLICY "Site managers can read site modules"
      ON public.site_modules
      FOR SELECT
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role, 'viewer'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_modules' AND policyname = 'Global admins and site owners manage site modules'
  ) THEN
    CREATE POLICY "Global admins and site owners manage site modules"
      ON public.site_modules
      FOR ALL
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      )
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

GRANT SELECT, INSERT, UPDATE ON TABLE public.site_modules TO authenticated;

CREATE TABLE IF NOT EXISTS public.support_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL CHECK (type IN ('platform', 'agency', 'internal')),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS support_organizations_slug_key ON public.support_organizations (slug);
CREATE UNIQUE INDEX IF NOT EXISTS support_organizations_internal_site_id_key
  ON public.support_organizations (site_id)
  WHERE type = 'internal' AND site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_organizations_site_id_idx ON public.support_organizations (site_id);
CREATE INDEX IF NOT EXISTS support_organizations_owner_user_id_idx ON public.support_organizations (owner_user_id);

DROP TRIGGER IF EXISTS update_support_organizations_updated_at ON public.support_organizations;
CREATE TRIGGER update_support_organizations_updated_at
BEFORE UPDATE ON public.support_organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.support_organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_organization_id uuid NOT NULL REFERENCES public.support_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'manager', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_organization_members_unique UNIQUE (support_organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS support_organization_members_org_idx ON public.support_organization_members (support_organization_id);
CREATE INDEX IF NOT EXISTS support_organization_members_user_idx ON public.support_organization_members (user_id);

DROP TRIGGER IF EXISTS update_support_organization_members_updated_at ON public.support_organization_members;
CREATE TRIGGER update_support_organization_members_updated_at
BEFORE UPDATE ON public.support_organization_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.site_support_settings (
  site_id uuid PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
  support_mode text NOT NULL DEFAULT 'platform_managed' CHECK (support_mode IN ('platform_managed', 'agency_managed', 'self_managed', 'hybrid')),
  support_organization_id uuid REFERENCES public.support_organizations(id) ON DELETE SET NULL,
  allow_platform_escalation boolean NOT NULL DEFAULT false,
  support_widget_enabled boolean NOT NULL DEFAULT true,
  support_email_enabled boolean NOT NULL DEFAULT true,
  default_sla_hours integer NOT NULL DEFAULT 24 CHECK (default_sla_hours BETWEEN 1 AND 720),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_site_support_settings_updated_at ON public.site_support_settings;
CREATE TRIGGER update_site_support_settings_updated_at
BEFORE UPDATE ON public.site_support_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  support_organization_id uuid NOT NULL REFERENCES public.support_organizations(id) ON DELETE RESTRICT,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('technical', 'billing', 'domain', 'content', 'bug', 'other')),
  source text NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'widget', 'email', 'system')),
  assigned_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  escalated_to_platform boolean NOT NULL DEFAULT false,
  last_reply_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_site_id_updated_at_idx ON public.tickets (site_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS tickets_support_org_id_updated_at_idx ON public.tickets (support_organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS tickets_assigned_to_user_id_idx ON public.tickets (assigned_to_user_id);

DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_type text NOT NULL CHECK (author_type IN ('customer', 'site_user', 'agent', 'platform', 'system')),
  message text NOT NULL,
  is_internal_note boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_created_at_idx ON public.ticket_messages (ticket_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_attachments_ticket_id_idx ON public.ticket_attachments (ticket_id);

CREATE TABLE IF NOT EXISTS public.ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  performed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_events_ticket_id_created_at_idx ON public.ticket_events (ticket_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.platform_support_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.support_organizations
  WHERE type = 'platform'
  ORDER BY created_at ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.support_internal_organization_id(p_site_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.support_organizations
  WHERE site_id = p_site_id
    AND type = 'internal'
  ORDER BY created_at ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.support_org_member_role(p_support_organization_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT som.role
  FROM public.support_organization_members som
  WHERE som.support_organization_id = p_support_organization_id
    AND som.user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_access_support_organization(p_support_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND (
      public.app_role()::text = 'admin'
      OR EXISTS (
        SELECT 1
        FROM public.support_organization_members som
        WHERE som.support_organization_id = p_support_organization_id
          AND som.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.support_organizations so
        WHERE so.id = p_support_organization_id
          AND so.site_id IS NOT NULL
          AND public.can_manage_site(so.site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.resolve_ticket_support_organization(p_site_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mode text;
  v_support_org_id uuid;
  v_internal_org_id uuid;
  v_platform_org_id uuid;
BEGIN
  SELECT support_mode, support_organization_id
    INTO v_mode, v_support_org_id
  FROM public.site_support_settings
  WHERE site_id = p_site_id;

  v_internal_org_id := public.support_internal_organization_id(p_site_id);
  v_platform_org_id := public.platform_support_organization_id();

  IF v_mode IS NULL THEN
    RETURN COALESCE(v_internal_org_id, v_platform_org_id);
  END IF;

  IF v_mode = 'platform_managed' THEN
    RETURN COALESCE(v_platform_org_id, v_support_org_id, v_internal_org_id);
  ELSIF v_mode = 'agency_managed' THEN
    RETURN COALESCE(v_support_org_id, v_internal_org_id, v_platform_org_id);
  ELSIF v_mode = 'hybrid' THEN
    RETURN COALESCE(v_support_org_id, v_internal_org_id, v_platform_org_id);
  END IF;

  RETURN COALESCE(v_internal_org_id, v_support_org_id, v_platform_org_id);
END
$$;

CREATE OR REPLACE FUNCTION public.can_access_ticket(p_ticket_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.tickets t
      WHERE t.id = p_ticket_id
        AND (
          public.app_role()::text = 'admin'
          OR public.can_manage_site(t.site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
          OR public.can_access_support_organization(t.support_organization_id)
        )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_create_support_ticket_for_site(p_site_id uuid, p_public boolean DEFAULT false)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sites s
    LEFT JOIN public.site_modules sm ON sm.site_id = s.id
    LEFT JOIN public.site_support_settings sss ON sss.site_id = s.id
    WHERE s.id = p_site_id
      AND s.is_active = true
      AND COALESCE(sm.has_support_desk, false) = true
      AND (
        CASE
          WHEN p_public THEN COALESCE(sss.support_widget_enabled, true)
          ELSE (
            public.app_role()::text = 'admin'
            OR public.can_manage_site(s.id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
          )
        END
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.create_support_ticket(
  p_site_id uuid,
  p_requester_name text,
  p_requester_email text,
  p_requester_phone text DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_category text DEFAULT 'other',
  p_message text DEFAULT NULL,
  p_source text DEFAULT 'widget'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_id uuid;
  v_support_org_id uuid;
  v_subject text;
BEGIN
  IF NOT public.can_create_support_ticket_for_site(p_site_id, true) THEN
    RAISE EXCEPTION 'Support ist für diese Site aktuell nicht öffentlich verfügbar.';
  END IF;

  v_support_org_id := public.resolve_ticket_support_organization(p_site_id);
  v_subject := NULLIF(trim(coalesce(p_subject, '')),'');
  IF v_subject IS NULL THEN
    v_subject := 'Neue Support-Anfrage';
  END IF;

  INSERT INTO public.tickets (
    site_id,
    support_organization_id,
    created_by_user_id,
    requester_name,
    requester_email,
    requester_phone,
    subject,
    category,
    source,
    status,
    priority
  ) VALUES (
    p_site_id,
    v_support_org_id,
    auth.uid(),
    NULLIF(trim(coalesce(p_requester_name, '')),''),
    NULLIF(trim(coalesce(p_requester_email, '')),''),
    NULLIF(trim(coalesce(p_requester_phone, '')),''),
    v_subject,
    CASE WHEN p_category IN ('technical', 'billing', 'domain', 'content', 'bug', 'other') THEN p_category ELSE 'other' END,
    CASE WHEN p_source IN ('admin', 'widget', 'email', 'system') THEN p_source ELSE 'widget' END,
    'open',
    'normal'
  ) RETURNING id INTO v_ticket_id;

  INSERT INTO public.ticket_messages (
    ticket_id,
    author_user_id,
    author_type,
    message,
    is_internal_note
  ) VALUES (
    v_ticket_id,
    auth.uid(),
    CASE WHEN auth.uid() IS NULL THEN 'customer' ELSE 'site_user' END,
    COALESCE(NULLIF(trim(coalesce(p_message, '')), ''), 'Ohne Zusatznachricht.'),
    false
  );

  INSERT INTO public.ticket_events (ticket_id, event_type, performed_by_user_id, payload)
  VALUES (
    v_ticket_id,
    'created',
    auth.uid(),
    jsonb_build_object('source', p_source, 'category', p_category)
  );

  RETURN v_ticket_id;
END
$$;

CREATE OR REPLACE FUNCTION public.get_public_support_settings(p_site_id uuid)
RETURNS TABLE (
  site_id uuid,
  has_support_desk boolean,
  support_widget_enabled boolean,
  support_email_enabled boolean,
  support_mode text,
  default_sla_hours integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    COALESCE(sm.has_support_desk, false) AS has_support_desk,
    COALESCE(sss.support_widget_enabled, true) AS support_widget_enabled,
    COALESCE(sss.support_email_enabled, true) AS support_email_enabled,
    COALESCE(sss.support_mode, 'platform_managed') AS support_mode,
    COALESCE(sss.default_sla_hours, 24) AS default_sla_hours
  FROM public.sites s
  LEFT JOIN public.site_modules sm ON sm.site_id = s.id
  LEFT JOIN public.site_support_settings sss ON sss.site_id = s.id
  WHERE s.id = p_site_id
    AND s.is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.ensure_site_support_defaults(
  p_site_id uuid,
  p_site_name text,
  p_site_slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_internal_org_id uuid;
BEGIN
  INSERT INTO public.site_modules (site_id)
  VALUES (p_site_id)
  ON CONFLICT (site_id) DO NOTHING;

  INSERT INTO public.support_organizations (site_id, name, slug, type, is_active)
  VALUES (
    p_site_id,
    coalesce(nullif(trim(p_site_name), ''), 'Site Support') || ' Support',
    left(regexp_replace(coalesce(nullif(trim(p_site_slug), ''), 'site') || '-support', '[^a-z0-9\-]+', '-', 'g'), 120),
    'internal',
    true
  )
  ON CONFLICT DO NOTHING;

  SELECT public.support_internal_organization_id(p_site_id) INTO v_internal_org_id;

  INSERT INTO public.site_support_settings (site_id, support_mode, support_organization_id, allow_platform_escalation, support_widget_enabled, support_email_enabled, default_sla_hours)
  VALUES (p_site_id, 'platform_managed', v_internal_org_id, false, true, true, 24)
  ON CONFLICT (site_id) DO NOTHING;
END
$$;

CREATE OR REPLACE FUNCTION public.handle_new_site_support_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_site_support_defaults(NEW.id, NEW.name, NEW.slug);
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS create_site_support_defaults ON public.sites;
CREATE TRIGGER create_site_support_defaults
AFTER INSERT ON public.sites
FOR EACH ROW EXECUTE FUNCTION public.handle_new_site_support_defaults();

CREATE OR REPLACE FUNCTION public.set_ticket_support_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.support_organization_id IS NULL THEN
    NEW.support_organization_id := public.resolve_ticket_support_organization(NEW.site_id);
  END IF;

  IF NEW.last_reply_at IS NULL THEN
    NEW.last_reply_at := now();
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS set_ticket_support_defaults ON public.tickets;
CREATE TRIGGER set_ticket_support_defaults
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.set_ticket_support_defaults();

CREATE OR REPLACE FUNCTION public.touch_ticket_from_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tickets
  SET last_reply_at = NEW.created_at,
      updated_at = now(),
      status = CASE WHEN NEW.is_internal_note THEN status ELSE 'in_progress' END
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS touch_ticket_from_message ON public.ticket_messages;
CREATE TRIGGER touch_ticket_from_message
AFTER INSERT ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_ticket_from_message();

INSERT INTO public.support_organizations (name, slug, type, is_active)
VALUES ('Digital Perfect Plattform', 'digital-perfect-platform', 'platform', true)
ON CONFLICT (slug) DO NOTHING;

SELECT public.ensure_site_support_defaults(s.id, s.name, s.slug)
FROM public.sites s;

ALTER TABLE public.support_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_support_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_organizations' AND policyname = 'Support orgs are readable for accessible users'
  ) THEN
    CREATE POLICY "Support orgs are readable for accessible users"
      ON public.support_organizations
      FOR SELECT
      TO authenticated
      USING (
        public.can_access_support_organization(id)
        OR (site_id IS NOT NULL AND public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role]))
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_organizations' AND policyname = 'Global admins manage support orgs'
  ) THEN
    CREATE POLICY "Global admins manage support orgs"
      ON public.support_organizations
      FOR ALL
      TO authenticated
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_organization_members' AND policyname = 'Support org members are readable for accessible users'
  ) THEN
    CREATE POLICY "Support org members are readable for accessible users"
      ON public.support_organization_members
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id
        OR public.can_access_support_organization(support_organization_id)
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_organization_members' AND policyname = 'Global admins manage support org members'
  ) THEN
    CREATE POLICY "Global admins manage support org members"
      ON public.support_organization_members
      FOR ALL
      TO authenticated
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_support_settings' AND policyname = 'Public can read site support settings'
  ) THEN
    CREATE POLICY "Public can read site support settings"
      ON public.site_support_settings
      FOR SELECT
      TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.sites s
          WHERE s.id = site_support_settings.site_id
            AND s.is_active = true
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_support_settings' AND policyname = 'Site managers manage support settings'
  ) THEN
    CREATE POLICY "Site managers manage support settings"
      ON public.site_support_settings
      FOR ALL
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      )
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tickets' AND policyname = 'Ticket access for support users'
  ) THEN
    CREATE POLICY "Ticket access for support users"
      ON public.tickets
      FOR SELECT
      TO authenticated
      USING (public.can_access_ticket(id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tickets' AND policyname = 'Site managers create tickets'
  ) THEN
    CREATE POLICY "Site managers create tickets"
      ON public.tickets
      FOR INSERT
      TO authenticated
      WITH CHECK (public.can_create_support_ticket_for_site(site_id, false));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tickets' AND policyname = 'Support users update tickets'
  ) THEN
    CREATE POLICY "Support users update tickets"
      ON public.tickets
      FOR UPDATE
      TO authenticated
      USING (public.can_access_ticket(id))
      WITH CHECK (public.can_access_ticket(id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_messages' AND policyname = 'Support users read ticket messages'
  ) THEN
    CREATE POLICY "Support users read ticket messages"
      ON public.ticket_messages
      FOR SELECT
      TO authenticated
      USING (public.can_access_ticket(ticket_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_messages' AND policyname = 'Support users create ticket messages'
  ) THEN
    CREATE POLICY "Support users create ticket messages"
      ON public.ticket_messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        public.can_access_ticket(ticket_id)
        AND (NOT is_internal_note OR auth.uid() IS NOT NULL)
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_attachments' AND policyname = 'Support users read ticket attachments'
  ) THEN
    CREATE POLICY "Support users read ticket attachments"
      ON public.ticket_attachments
      FOR SELECT
      TO authenticated
      USING (public.can_access_ticket(ticket_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_attachments' AND policyname = 'Support users create ticket attachments'
  ) THEN
    CREATE POLICY "Support users create ticket attachments"
      ON public.ticket_attachments
      FOR INSERT
      TO authenticated
      WITH CHECK (public.can_access_ticket(ticket_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_events' AND policyname = 'Support users read ticket events'
  ) THEN
    CREATE POLICY "Support users read ticket events"
      ON public.ticket_events
      FOR SELECT
      TO authenticated
      USING (public.can_access_ticket(ticket_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ticket_events' AND policyname = 'Support users create ticket events'
  ) THEN
    CREATE POLICY "Support users create ticket events"
      ON public.ticket_events
      FOR INSERT
      TO authenticated
      WITH CHECK (public.can_access_ticket(ticket_id));
  END IF;
END
$$;

GRANT SELECT ON TABLE public.support_organizations TO authenticated;
GRANT SELECT ON TABLE public.support_organization_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.site_support_settings TO authenticated;
GRANT SELECT ON TABLE public.site_support_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.tickets TO authenticated;
GRANT SELECT, INSERT ON TABLE public.ticket_messages TO authenticated;
GRANT SELECT, INSERT ON TABLE public.ticket_attachments TO authenticated;
GRANT SELECT, INSERT ON TABLE public.ticket_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_support_organization_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.support_internal_organization_id(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.support_org_member_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_support_organization(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_ticket_support_organization(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_ticket(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_create_support_ticket_for_site(uuid, boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_support_ticket(uuid, text, text, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_support_settings(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_site_support_defaults(uuid, text, text) TO service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Support attachment objects are readable for ticket users'
  ) THEN
    CREATE POLICY "Support attachment objects are readable for ticket users"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'support-attachments'
        AND CASE
          WHEN split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$' THEN public.can_access_ticket(split_part(name, '/', 1)::uuid)
          ELSE false
        END
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Support attachment objects are insertable for ticket users'
  ) THEN
    CREATE POLICY "Support attachment objects are insertable for ticket users"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'support-attachments'
        AND CASE
          WHEN split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$' THEN public.can_access_ticket(split_part(name, '/', 1)::uuid)
          ELSE false
        END
      );
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
