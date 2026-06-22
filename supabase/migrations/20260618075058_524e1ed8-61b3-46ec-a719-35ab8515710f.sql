
-- 1) Remove privilege-escalation policy on user_roles
DROP POLICY IF EXISTS user_roles_self_insert ON public.user_roles;

-- 2) Restrict settings reads to admins
DROP POLICY IF EXISTS settings_read ON public.settings;
CREATE POLICY settings_admin_read ON public.settings FOR SELECT TO authenticated USING (public.is_admin());

-- 3) Restrict resource_grants reads to own grants or admins
DROP POLICY IF EXISTS grants_read_all ON public.resource_grants;
CREATE POLICY grants_read_own_or_admin ON public.resource_grants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- 4) Restrict quality_sheet_config reads to admins/SMEs
DROP POLICY IF EXISTS qsc_read_all ON public.quality_sheet_config;
CREATE POLICY qsc_admin_sme_read ON public.quality_sheet_config FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_sme());

-- 5) Fix mutable search_path on trigger functions
ALTER FUNCTION public.touch_project_last_updated() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- 6) Realtime channel authorization: only allow subscribers who can read the underlying tables
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "realtime_worklog_read" ON realtime.messages;
CREATE POLICY "realtime_worklog_read" ON realtime.messages FOR SELECT TO authenticated
USING (
  -- Restrict worklog-related topics to admins/SMEs (matches table RLS)
  CASE
    WHEN (realtime.topic() LIKE 'work_log%' OR realtime.topic() LIKE 'worklog%')
      THEN public.is_admin() OR public.is_sme()
    ELSE auth.uid() IS NOT NULL
  END
);
