-- Comments on individual worklog entries. Admin/SME can comment on anyone's
-- entry; the entry's own author can read and reply to comments on their own
-- entry (so feedback surfaces without needing roster/team access).
CREATE TABLE IF NOT EXISTS public.work_log_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.work_log_comments TO authenticated;
GRANT ALL ON public.work_log_comments TO service_role;
ALTER TABLE public.work_log_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wlc read" ON public.work_log_comments
  FOR SELECT TO authenticated USING (
    public.is_admin() OR public.is_sme()
    OR EXISTS (SELECT 1 FROM public.work_log_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())
  );

CREATE POLICY "wlc insert" ON public.work_log_comments
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin() OR public.is_sme()
      OR EXISTS (SELECT 1 FROM public.work_log_entries e WHERE e.id = entry_id AND e.user_id = auth.uid())
    )
  );

CREATE POLICY "wlc delete" ON public.work_log_comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_admin());

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='work_log_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.work_log_comments;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
