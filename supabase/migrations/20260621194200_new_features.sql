-- Add priority column to work_log_entries
ALTER TABLE public.work_log_entries ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0','P1','P2','P3'));

-- Create project_co_owners table
CREATE TABLE IF NOT EXISTS public.project_co_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  working_on text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_co_owners TO authenticated;
GRANT ALL ON public.project_co_owners TO service_role;

ALTER TABLE public.project_co_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pco_read_all" ON public.project_co_owners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "pco_write_admin_sme" ON public.project_co_owners
  FOR ALL TO authenticated
  USING (public.is_sme())
  WITH CHECK (public.is_sme());

CREATE TRIGGER trg_pco_updated BEFORE UPDATE ON public.project_co_owners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Add user_analytics_url to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_analytics_url text;

-- Add activity_log to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
