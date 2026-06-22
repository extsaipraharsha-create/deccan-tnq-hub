
-- =========================================================
-- ENUM TYPES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tnq_team', 'contributor', 'pending');
CREATE TYPE public.user_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE public.project_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE public.module_type AS ENUM ('video', 'reading', 'quiz', 'assessment');
CREATE TYPE public.playground_status AS ENUM ('not_started','in_progress','under_sme_review','under_qa_review','needs_revision','ready_for_publishing','live','archived');
CREATE TYPE public.content_item_status AS ENUM ('not_started','in_progress','completed','needs_revision');
CREATE TYPE public.review_type AS ENUM ('sme','qa','content');
CREATE TYPE public.review_status AS ENUM ('pending','approved','approved_with_changes','rejected');
CREATE TYPE public.onboarding_status AS ENUM ('not_started','in_progress','complete');
CREATE TYPE public.progress_status AS ENUM ('locked','available','complete');
CREATE TYPE public.issue_status AS ENUM ('open','resolved');
CREATE TYPE public.resource_category AS ENUM ('team_sheet','project_doc','template','external_link');
CREATE TYPE public.permission_level AS ENUM ('view_only','can_edit','can_upload','full_access');
CREATE TYPE public.activity_action_type AS ENUM ('created','updated','deleted','login','role_changed','grant_added','grant_revoked');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  photo_url TEXT,
  first_login BOOLEAN NOT NULL DEFAULT TRUE,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USER ROLES
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'pending',
  assigned_sme_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_sme()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','tnq_team'))
$$;

-- =========================================================
-- PROJECTS
-- =========================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  sme_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.project_status NOT NULL DEFAULT 'active',
  guidelines_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- LEARNING PATHS
-- =========================================================
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_paths TO authenticated;
GRANT ALL ON public.learning_paths TO service_role;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.learning_path_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type public.module_type NOT NULL DEFAULT 'reading',
  order_index INT NOT NULL DEFAULT 0,
  completion_criteria TEXT,
  estimated_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_path_modules TO authenticated;
GRANT ALL ON public.learning_path_modules TO service_role;
ALTER TABLE public.learning_path_modules ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- PLAYGROUNDS
-- =========================================================
CREATE TABLE public.playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  status public.playground_status NOT NULL DEFAULT 'not_started',
  progress_percent INT NOT NULL DEFAULT 0,
  sme_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_ids UUID[] DEFAULT '{}',
  target_go_live DATE,
  version_number TEXT DEFAULT 'v1.0',
  workflow_stage TEXT,
  access_type TEXT DEFAULT 'private',
  estimated_duration TEXT,
  description TEXT,
  learning_objectives TEXT[] DEFAULT '{}',
  access_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playgrounds TO authenticated;
GRANT ALL ON public.playgrounds TO service_role;
ALTER TABLE public.playgrounds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playground_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES public.playgrounds(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  status public.content_item_status NOT NULL DEFAULT 'not_started',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_content_items TO authenticated;
GRANT ALL ON public.playground_content_items TO service_role;
ALTER TABLE public.playground_content_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playground_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES public.playgrounds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  status TEXT,
  order_index INT NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_nodes TO authenticated;
GRANT ALL ON public.playground_nodes TO service_role;
ALTER TABLE public.playground_nodes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playground_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES public.playgrounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version_number TEXT,
  file_size BIGINT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_documents TO authenticated;
GRANT ALL ON public.playground_documents TO service_role;
ALTER TABLE public.playground_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playground_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES public.playgrounds(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_type public.review_type NOT NULL,
  status public.review_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  requested_changes TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_reviews TO authenticated;
GRANT ALL ON public.playground_reviews TO service_role;
ALTER TABLE public.playground_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playground_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id UUID NOT NULL REFERENCES public.playgrounds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  section TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.playground_activity TO authenticated;
GRANT ALL ON public.playground_activity TO service_role;
ALTER TABLE public.playground_activity ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CONTRIBUTORS
-- =========================================================
CREATE TABLE public.contributors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sme_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  projects UUID[] DEFAULT '{}',
  onboarding_status public.onboarding_status NOT NULL DEFAULT 'not_started',
  onboarding_stage INT NOT NULL DEFAULT 1,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  playground_id UUID REFERENCES public.playgrounds(id) ON DELETE SET NULL,
  last_active_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributors TO authenticated;
GRANT ALL ON public.contributors TO service_role;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contributor_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_path_modules(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'locked',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributor_progress TO authenticated;
GRANT ALL ON public.contributor_progress TO service_role;
ALTER TABLE public.contributor_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contributor_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributor_achievements TO authenticated;
GRANT ALL ON public.contributor_achievements TO service_role;
ALTER TABLE public.contributor_achievements ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- QUALITY
-- =========================================================
CREATE TABLE public.quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  sme_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issue TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.issue_status NOT NULL DEFAULT 'open',
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_issues TO authenticated;
GRANT ALL ON public.quality_issues TO service_role;
ALTER TABLE public.quality_issues ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  score NUMERIC(5,2) NOT NULL,
  review_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_scores TO authenticated;
GRANT ALL ON public.quality_scores TO service_role;
ALTER TABLE public.quality_scores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quality_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_notes TO authenticated;
GRANT ALL ON public.quality_notes TO service_role;
ALTER TABLE public.quality_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.quality_sheet_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_embed_url TEXT,
  sheet_csv_url TEXT,
  sheet_label TEXT,
  linked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_sheet_config TO authenticated;
GRANT ALL ON public.quality_sheet_config TO service_role;
ALTER TABLE public.quality_sheet_config ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RESOURCES
-- =========================================================
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.resource_category NOT NULL DEFAULT 'external_link',
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  url TEXT NOT NULL,
  file_type TEXT,
  visible_to TEXT[] DEFAULT ARRAY['super_admin','tnq_team','contributor']
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.resource_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  permission public.permission_level NOT NULL DEFAULT 'view_only',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_grants TO authenticated;
GRANT ALL ON public.resource_grants TO service_role;
ALTER TABLE public.resource_grants ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- ACTIVITY, SETTINGS, SOURCES, WALL
-- =========================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  action_type public.activity_action_type NOT NULL DEFAULT 'updated',
  target TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.settings (key, value) VALUES
  ('site_name', 'Deccan AI TnQ Hub'),
  ('announcement', ''),
  ('maintenance_mode', 'false'),
  ('admin_sources_password', 'admin123'),
  ('force_tour_reset', 'false');

CREATE TABLE public.admin_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  source_type TEXT,
  url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sources TO authenticated;
GRANT ALL ON public.admin_sources TO service_role;
ALTER TABLE public.admin_sources ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wall_of_excellence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wall_of_excellence TO authenticated;
GRANT ALL ON public.wall_of_excellence TO service_role;
ALTER TABLE public.wall_of_excellence ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());

-- user_roles
CREATE POLICY "user_roles_read_all" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "user_roles_self_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- projects
CREATE POLICY "projects_read_all" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_sme_write" ON public.projects FOR ALL TO authenticated USING (public.is_admin() OR sme_owner_id = auth.uid()) WITH CHECK (public.is_admin() OR sme_owner_id = auth.uid());

-- learning_paths
CREATE POLICY "lp_read_all" ON public.learning_paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "lp_sme_write" ON public.learning_paths FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "lpm_read_all" ON public.learning_path_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "lpm_sme_write" ON public.learning_path_modules FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

-- playgrounds and children
CREATE POLICY "pg_read_all" ON public.playgrounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "pg_sme_write" ON public.playgrounds FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "pgc_read_all" ON public.playground_content_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "pgc_sme_write" ON public.playground_content_items FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "pgn_read_all" ON public.playground_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "pgn_sme_write" ON public.playground_nodes FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "pgd_read_all" ON public.playground_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "pgd_sme_write" ON public.playground_documents FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "pgr_read_all" ON public.playground_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "pgr_sme_write" ON public.playground_reviews FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "pga_read_sme" ON public.playground_activity FOR SELECT TO authenticated USING (public.is_sme());
CREATE POLICY "pga_insert_self" ON public.playground_activity FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- contributors
CREATE POLICY "contrib_read" ON public.contributors FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_sme());
CREATE POLICY "contrib_sme_write" ON public.contributors FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());
CREATE POLICY "contrib_self_update" ON public.contributors FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "cp_read" ON public.contributor_progress FOR SELECT TO authenticated USING (contributor_id = auth.uid() OR public.is_sme());
CREATE POLICY "cp_write" ON public.contributor_progress FOR ALL TO authenticated USING (contributor_id = auth.uid() OR public.is_sme()) WITH CHECK (contributor_id = auth.uid() OR public.is_sme());

CREATE POLICY "ca_read" ON public.contributor_achievements FOR SELECT TO authenticated USING (contributor_id = auth.uid() OR public.is_sme());
CREATE POLICY "ca_write" ON public.contributor_achievements FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

-- quality
CREATE POLICY "qi_read" ON public.quality_issues FOR SELECT TO authenticated USING (contributor_id = auth.uid() OR public.is_sme());
CREATE POLICY "qi_write" ON public.quality_issues FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "qs_read" ON public.quality_scores FOR SELECT TO authenticated USING (contributor_id = auth.uid() OR public.is_sme());
CREATE POLICY "qs_write" ON public.quality_scores FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "qn_read" ON public.quality_notes FOR SELECT TO authenticated USING (public.is_sme());
CREATE POLICY "qn_write" ON public.quality_notes FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "qsc_read_all" ON public.quality_sheet_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "qsc_sme_write" ON public.quality_sheet_config FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

-- resources
CREATE POLICY "resources_read" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "resources_sme_write" ON public.resources FOR ALL TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "grants_read_all" ON public.resource_grants FOR SELECT TO authenticated USING (true);
CREATE POLICY "grants_admin_write" ON public.resource_grants FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- activity log
CREATE POLICY "al_read_admin" ON public.activity_log FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "al_insert_self" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- settings
CREATE POLICY "settings_read" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- admin_sources
CREATE POLICY "as_admin_only" ON public.admin_sources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- wall_of_excellence
CREATE POLICY "woe_read" ON public.wall_of_excellence FOR SELECT TO authenticated USING (true);
CREATE POLICY "woe_admin_write" ON public.wall_of_excellence FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================
-- TRIGGERS
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_first BOOLEAN;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') INTO is_first;

  INSERT INTO public.profiles (id, name, email, photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role, status)
  VALUES (
    NEW.id,
    CASE WHEN is_first THEN 'super_admin'::public.app_role ELSE 'pending'::public.app_role END,
    CASE WHEN is_first THEN 'active'::public.user_status ELSE 'pending'::public.user_status END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_user_roles_updated BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pg_reviews_updated BEFORE UPDATE ON public.playground_reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
