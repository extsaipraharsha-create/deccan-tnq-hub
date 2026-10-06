-- Section 1: single source of truth for entry completion.
--
-- Today, completion is tracked two independent ways: `entry_type = 'completed'`
-- (the category) and `completed_at` (a timestamp set by a totally separate
-- code path). This migration adds what's needed for the app to collapse
-- those into one state machine, going through one shared client-side
-- function (`setEntryCompleted`) for every completion/undo everywhere.

-- 1. Remember what category an entry was in before it was marked complete,
--    so "undo" can restore it instead of guessing a default.
ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS previous_entry_type text
    CHECK (
      previous_entry_type IS NULL OR previous_entry_type = ANY (
        ARRAY['working_on','need_help','completed','blocked','review_needed','available_to_help']
      )
    );

-- 2. Marks a completed_at value that was backfilled by this migration (i.e.
--    not a real completion timestamp) rather than genuinely recorded at
--    completion time, so time-based report metrics can exclude it later.
ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS completed_at_estimated boolean NOT NULL DEFAULT false;

-- 3. Data cleanup: reconcile existing rows where the two signals disagree.
--    Runs before the history trigger and the updated_at trigger below are
--    created, so this one-time backfill doesn't generate fake history rows
--    or stomp on the very updated_at values step 3b reads from.

-- 3a. completed_at was set (by the old markComplete) but the category was
--     never flipped - stash the real category, then flip it.
UPDATE public.work_log_entries
SET previous_entry_type = entry_type,
    entry_type = 'completed'
WHERE completed_at IS NOT NULL
  AND entry_type <> 'completed';

-- 3b. category was set to 'completed' via the edit form but completed_at was
--     never written. `updated_at` exists on this table but - worth flagging -
--     nothing has ever actually written to it before this migration (no
--     trigger, and the app's update calls don't set it either), so in
--     practice it's always equal to created_at today. Flagged as estimated
--     either way, since this is a backfilled guess, not a real timestamp.
UPDATE public.work_log_entries
SET completed_at = COALESCE(updated_at, created_at),
    completed_at_estimated = true
WHERE entry_type = 'completed'
  AND completed_at IS NULL;

-- 4. Status-change history, so "time spent in Blocked" etc. can be computed
--    later once data has accumulated (Section 2 explicitly skips it for now).
--    Created and attached after the cleanup above runs.
CREATE TABLE IF NOT EXISTS public.work_log_entry_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.work_log_entries(id) ON DELETE CASCADE,
  from_type text,
  to_type text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.work_log_entry_status_history TO authenticated;
GRANT ALL ON public.work_log_entry_status_history TO service_role;
ALTER TABLE public.work_log_entry_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wlesh read" ON public.work_log_entry_status_history
  FOR SELECT TO authenticated USING (true);
-- No INSERT/UPDATE/DELETE policy for authenticated - this table is only ever
-- written by the trigger below (SECURITY DEFINER), never directly by a client.

CREATE OR REPLACE FUNCTION public.log_work_log_entry_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.entry_type IS DISTINCT FROM OLD.entry_type THEN
    INSERT INTO public.work_log_entry_status_history (entry_id, from_type, to_type, changed_by)
    VALUES (NEW.id, OLD.entry_type, NEW.entry_type, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS work_log_entries_status_history ON public.work_log_entries;
CREATE TRIGGER work_log_entries_status_history
  AFTER UPDATE ON public.work_log_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_work_log_entry_status_change();

-- 5. Keep updated_at maintained going forward (it previously existed but
--    nothing wrote to it). Reuses the existing touch_updated_at() function
--    already used elsewhere in this schema. Attached after the cleanup
--    above so that one-time backfill doesn't overwrite the very updated_at
--    values step 3b reads from.
DROP TRIGGER IF EXISTS work_log_entries_touch_updated_at ON public.work_log_entries;
CREATE TRIGGER work_log_entries_touch_updated_at
  BEFORE UPDATE ON public.work_log_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

-- 6. Let marking an entry complete auto-close an open review request on it,
--    even when the person doing so is the requester (not the reviewer) -
--    the existing "wlrr update" policy only allows the reviewer or an admin
--    to change status, so without this, the requester's own completion
--    action would be denied by RLS when it tries to close their request.

-- 6a. New terminal status, distinct from 'approved' (per spec: this is a
--     closure because the task is done, not a review outcome).
ALTER TABLE public.work_log_review_requests
  DROP CONSTRAINT IF EXISTS work_log_review_requests_status_check;
ALTER TABLE public.work_log_review_requests
  ADD CONSTRAINT work_log_review_requests_status_check
    CHECK (status IN ('pending', 'approved', 'changes_requested', 'cancelled_completed'));

-- 6b. SECURITY DEFINER function instead of a client-facing UPDATE policy -
--     this sidesteps RLS's WITH CHECK only validating the resulting row (not
--     a diff against the old one): because this function's body is the only
--     thing that can reach the table on the requester's behalf, and it only
--     ever sets status + reviewed_at, no other column can be touched via
--     this path, full stop.
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
    AND requested_by = auth.uid()
    AND status = 'pending';
END;
$$;
GRANT EXECUTE ON FUNCTION public.cancel_review_on_completion(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
