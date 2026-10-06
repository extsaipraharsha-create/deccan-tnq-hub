-- Three follow-ups to the Section 1 migration.

-- 1. cancel_review_on_completion: also allow an admin to close someone
--    else's review request when completing their entry on their behalf,
--    not just the original requester.
CREATE OR REPLACE FUNCTION public.cancel_review_on_completion(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.work_log_review_requests
  SET status = 'cancelled_completed',
      reviewed_at = now()
  WHERE id = request_id
    AND status = 'pending'
    AND (requested_by = auth.uid() OR public.is_admin());
END;
$$;

-- 2. Status history: also log the initial category on INSERT (from_type
--    null), not just category changes on UPDATE. No backfill for entries
--    that already existed before this migration - only new rows going
--    forward get an INSERT-origin history row.
CREATE OR REPLACE FUNCTION public.log_work_log_entry_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.work_log_entry_status_history (entry_id, from_type, to_type, changed_by)
    VALUES (NEW.id, NULL, NEW.entry_type, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.entry_type IS DISTINCT FROM OLD.entry_type THEN
      INSERT INTO public.work_log_entry_status_history (entry_id, from_type, to_type, changed_by)
      VALUES (NEW.id, OLD.entry_type, NEW.entry_type, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS work_log_entries_status_history ON public.work_log_entries;
CREATE TRIGGER work_log_entries_status_history
  AFTER INSERT OR UPDATE ON public.work_log_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_work_log_entry_status_change();

-- 3. Server-side snooze for the deadline popup's "Remind me in 1 hour",
--    replacing the client-only version so it survives reloads and works
--    the same across devices/tabs.
ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

NOTIFY pgrst, 'reload schema';
