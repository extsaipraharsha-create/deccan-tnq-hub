-- Deadline reminders + push notifications
-- Adds completion/reminder tracking to work_log_entries, a history table for
-- deadline reschedules, and a table of browser push subscriptions.

ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS overdue_notified_at timestamptz;

-- ----- work_log_delay_log -----
-- One row per reschedule of an overdue task: what the deadline was, what it
-- became, and why. Keeps a full history even if the same task slips more
-- than once.
CREATE TABLE IF NOT EXISTS public.work_log_delay_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  old_deadline timestamptz NOT NULL,
  new_deadline timestamptz NOT NULL,
  reason text NOT NULL,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.work_log_delay_log TO authenticated;
GRANT ALL ON public.work_log_delay_log TO service_role;

ALTER TABLE public.work_log_delay_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wldl read team" ON public.work_log_delay_log
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_sme() OR user_id = auth.uid());

CREATE POLICY "wldl insert own" ON public.work_log_delay_log
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.work_log_entries e
      WHERE e.id = entry_id AND e.user_id = auth.uid()
    )
  );

-- ----- push_subscriptions -----
-- One row per browser/device a user has enabled deadline push reminders on.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subs own" ON public.push_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ----- Scheduler plumbing -----
-- pg_cron fires a Supabase Edge Function on a schedule; pg_net is what lets
-- a cron job make that outbound HTTP call from inside Postgres.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
