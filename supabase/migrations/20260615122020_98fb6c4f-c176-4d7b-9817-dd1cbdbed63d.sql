
-- Add columns to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS given_name text,
  ADD COLUMN IF NOT EXISTS audience_type text,
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS current_owner_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS previous_owner_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS emoji_icon text DEFAULT '📁';

-- project_links
CREATE TABLE IF NOT EXISTS public.project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  link_type text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  added_by uuid REFERENCES auth.users(id),
  added_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_links TO authenticated;
GRANT ALL ON public.project_links TO service_role;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_links read auth" ON public.project_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_links write admin/sme" ON public.project_links FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_sme() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.sme_owner_id = auth.uid()))
  WITH CHECK (public.is_admin() OR public.is_sme() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.sme_owner_id = auth.uid()));
CREATE TRIGGER project_links_touch BEFORE UPDATE ON public.project_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- work_log_entries
CREATE TABLE IF NOT EXISTS public.work_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('working_on','need_help','completed','blocked','review_needed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_log_entries TO authenticated;
GRANT ALL ON public.work_log_entries TO service_role;
ALTER TABLE public.work_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wle read team" ON public.work_log_entries FOR SELECT TO authenticated USING (public.is_admin() OR public.is_sme());
CREATE POLICY "wle insert team" ON public.work_log_entries FOR INSERT TO authenticated WITH CHECK ((public.is_admin() OR public.is_sme()) AND user_id = auth.uid());
CREATE POLICY "wle update own" ON public.work_log_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "wle delete own" ON public.work_log_entries FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER wle_touch BEFORE UPDATE ON public.work_log_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- work_log_reactions
CREATE TABLE IF NOT EXISTS public.work_log_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'helpful',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_log_reactions TO authenticated;
GRANT ALL ON public.work_log_reactions TO service_role;
ALTER TABLE public.work_log_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wlr read auth" ON public.work_log_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "wlr write team" ON public.work_log_reactions FOR INSERT TO authenticated WITH CHECK ((public.is_admin() OR public.is_sme()) AND user_id = auth.uid());
CREATE POLICY "wlr delete own" ON public.work_log_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- work_log_comments
CREATE TABLE IF NOT EXISTS public.work_log_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_log_comments TO authenticated;
GRANT ALL ON public.work_log_comments TO service_role;
ALTER TABLE public.work_log_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wlc read team" ON public.work_log_comments FOR SELECT TO authenticated USING (public.is_admin() OR public.is_sme());
CREATE POLICY "wlc write team" ON public.work_log_comments FOR INSERT TO authenticated WITH CHECK ((public.is_admin() OR public.is_sme()) AND user_id = auth.uid());
CREATE POLICY "wlc delete own" ON public.work_log_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_log_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_log_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_log_comments;
