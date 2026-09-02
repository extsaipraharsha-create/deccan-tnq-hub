-- Replaces the passive "Review Needed" label with an actual workflow: a
-- specific reviewer, a status, and a closed loop back to the requester.
CREATE TABLE IF NOT EXISTS public.work_log_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reminder_last_sent_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.work_log_review_requests TO authenticated;
GRANT ALL ON public.work_log_review_requests TO service_role;
ALTER TABLE public.work_log_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wlrr read" ON public.work_log_review_requests
  FOR SELECT TO authenticated USING (
    requested_by = auth.uid() OR reviewer_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "wlrr insert" ON public.work_log_review_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

CREATE POLICY "wlrr update" ON public.work_log_review_requests
  FOR UPDATE TO authenticated USING (reviewer_id = auth.uid() OR public.is_admin())
  WITH CHECK (reviewer_id = auth.uid() OR public.is_admin());

-- P0-specific overdue escalation (Feature 6), separate from the general
-- one-shot overdue push so a still-overdue P0 can be re-flagged distinctly.
ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS p0_escalation_sent_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='work_log_review_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.work_log_review_requests;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
