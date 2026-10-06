-- Schedules the weekly digest push for Friday evening. pg_cron runs in UTC;
-- 12:30 UTC = 18:00 IST, a single fixed server time (there's no way for a
-- server-side cron to run "at each viewer's own local evening" the way the
-- in-app digest card can per-browser).
SELECT cron.schedule(
  'weekly-digest-friday',
  '30 12 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://pdmwnegijkabaozcmpvy.supabase.co/functions/v1/send-weekly-digest',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<SAME CRON_SECRET AS THE EXISTING send-deadline-reminders JOB>'),
    body := '{}'::jsonb
  );
  $$
);
