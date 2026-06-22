
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS links text,
  ADD COLUMN IF NOT EXISTS auditing_status text NOT NULL DEFAULT 'not_live' CHECK (auditing_status IN ('live','not_live'));
