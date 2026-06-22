
-- Projects: tasking live + auto-tracked update metadata
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS tasking_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_updated timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_updated_by uuid;

-- Playgrounds: live status + dashboard link
ALTER TABLE public.playgrounds
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_since timestamptz,
  ADD COLUMN IF NOT EXISTS dashboard_url text,
  ADD COLUMN IF NOT EXISTS docs_url text,
  ADD COLUMN IF NOT EXISTS active_users_count integer;

-- Activity log: field change tracking
ALTER TABLE public.activity_log
  ADD COLUMN IF NOT EXISTS field_changed text,
  ADD COLUMN IF NOT EXISTS old_value text,
  ADD COLUMN IF NOT EXISTS new_value text;

-- Newcomer resources table
CREATE TABLE IF NOT EXISTS public.newcomer_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  poc_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  doc_label text,
  doc_url text,
  video_label text,
  video_url text,
  notes text,
  last_updated timestamptz NOT NULL DEFAULT now(),
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newcomer_resources TO authenticated;
GRANT ALL ON public.newcomer_resources TO service_role;

ALTER TABLE public.newcomer_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Newcomer resources readable by authenticated"
  ON public.newcomer_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Newcomer resources writable by sme/admin"
  ON public.newcomer_resources FOR ALL
  TO authenticated
  USING (public.is_sme())
  WITH CHECK (public.is_sme());

-- Auto touch last_updated on project edits
CREATE OR REPLACE FUNCTION public.touch_project_last_updated()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_last_updated ON public.projects;
CREATE TRIGGER trg_projects_last_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_project_last_updated();

-- Touch newcomer_resources last_updated
DROP TRIGGER IF EXISTS trg_newcomer_last_updated ON public.newcomer_resources;
CREATE TRIGGER trg_newcomer_last_updated
  BEFORE UPDATE ON public.newcomer_resources
  FOR EACH ROW EXECUTE FUNCTION public.touch_project_last_updated();
