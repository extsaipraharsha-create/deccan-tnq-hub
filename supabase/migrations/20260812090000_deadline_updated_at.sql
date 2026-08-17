-- Tracks the last time a task's deadline was changed (reschedule or inline
-- edit), separate from created_at (when it was originally posted). Worklog
-- uses this to surface rescheduled tasks as recent instead of leaving them
-- buried under their original post date.
ALTER TABLE public.work_log_entries
  ADD COLUMN IF NOT EXISTS deadline_updated_at timestamptz;
