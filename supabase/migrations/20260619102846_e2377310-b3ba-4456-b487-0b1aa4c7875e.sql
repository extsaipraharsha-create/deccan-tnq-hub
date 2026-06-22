
-- Add missing columns to playgrounds (preserve existing functionality)
ALTER TABLE public.playgrounds
  ADD COLUMN IF NOT EXISTS content_url text,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- New table: learning_path_items
CREATE TABLE IF NOT EXISTS public.learning_path_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  version text NOT NULL DEFAULT 'V1',
  is_live boolean NOT NULL DEFAULT false,
  live_since timestamptz,
  user_url text,
  production_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now(),
  last_updated_by uuid,
  display_order integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_path_items TO authenticated;
GRANT ALL ON public.learning_path_items TO service_role;

ALTER TABLE public.learning_path_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lpi_read_all" ON public.learning_path_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "lpi_write_sme" ON public.learning_path_items
  FOR INSERT TO authenticated WITH CHECK (public.is_sme());

CREATE POLICY "lpi_update_sme" ON public.learning_path_items
  FOR UPDATE TO authenticated USING (public.is_sme()) WITH CHECK (public.is_sme());

CREATE POLICY "lpi_delete_admin" ON public.learning_path_items
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER lpi_touch_updated BEFORE UPDATE ON public.learning_path_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- New table: workspace_group_order (per-user group ordering preference)
CREATE TABLE IF NOT EXISTS public.workspace_group_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_type text NOT NULL CHECK (workspace_type IN ('playgrounds','learning_paths')),
  project_id uuid NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_type, project_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_group_order TO authenticated;
GRANT ALL ON public.workspace_group_order TO service_role;

ALTER TABLE public.workspace_group_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wgo_own_select" ON public.workspace_group_order
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wgo_own_write" ON public.workspace_group_order
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
