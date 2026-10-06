-- work_log_entries.updated_at was being touched by every UPDATE, including
-- system-written reminder/snooze bookkeeping (reminder_sent_at,
-- overdue_notified_at, p0_escalation_sent_at from send-deadline-reminders,
-- and snoozed_until from "Remind me in 1 hour"), which the Team Roster's
-- activity index reads as "this person did something today". Scope the
-- touch to only the user-facing fields so those background writes stop
-- counting as activity. A dedicated function (not the shared
-- touch_updated_at()) since that one is reused by other tables that don't
-- need this column-scoping.
CREATE OR REPLACE FUNCTION public.touch_work_log_entries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF (OLD.content IS DISTINCT FROM NEW.content)
    OR (OLD.entry_type IS DISTINCT FROM NEW.entry_type)
    OR (OLD.priority IS DISTINCT FROM NEW.priority)
    OR (OLD.deadline IS DISTINCT FROM NEW.deadline)
    OR (OLD.project_id IS DISTINCT FROM NEW.project_id)
    OR (OLD.completed_at IS DISTINCT FROM NEW.completed_at)
  THEN
    NEW.updated_at = now();
  ELSE
    NEW.updated_at = OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS work_log_entries_touch_updated_at ON public.work_log_entries;
CREATE TRIGGER work_log_entries_touch_updated_at
  BEFORE UPDATE ON public.work_log_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_work_log_entries_updated_at();
