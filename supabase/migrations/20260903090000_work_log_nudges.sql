-- Lets an SME/admin nudge someone about an open worklog entry from the Team
-- Roster. Reduced scope per spec: in-app record + toast only for now, push
-- delivery is a flagged follow-up (not this migration).
CREATE TABLE IF NOT EXISTS public.work_log_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.work_log_nudges TO authenticated;
GRANT ALL ON public.work_log_nudges TO service_role;
ALTER TABLE public.work_log_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wln read" ON public.work_log_nudges
  FOR SELECT TO authenticated USING (from_user = auth.uid() OR to_user = auth.uid());

CREATE POLICY "wln insert" ON public.work_log_nudges
  FOR INSERT TO authenticated WITH CHECK (
    from_user = auth.uid() AND (public.is_admin() OR public.is_sme())
  );

NOTIFY pgrst, 'reload schema';
