-- New role "deccan_team": a separately-labeled category with identical
-- access to "tnq_team" (not a replacement for it, and not admin access).
-- is_sme() is the single choke point nearly every RLS policy in the schema
-- calls through, so extending it here is what actually grants the access --
-- matches the client-side isTeamRole() helper in src/lib/tnq/types.ts.

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role = ANY (ARRAY['super_admin'::text, 'tnq_team'::text, 'deccan_team'::text, 'contributor'::text, 'pending'::text]));

CREATE OR REPLACE FUNCTION public.is_sme()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','tnq_team','deccan_team'))
$function$;

NOTIFY pgrst, 'reload schema';
