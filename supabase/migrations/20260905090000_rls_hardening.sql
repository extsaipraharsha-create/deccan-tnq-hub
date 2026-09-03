-- Security hardening: a set of leftover "authenticated write X" policies
-- (qual = true, cmd = ALL) coexist with the correctly-scoped policies added
-- later. Postgres RLS policies are OR'd together, so these permissive
-- leftovers silently defeat every scoped policy on the same table -- any
-- authenticated user, including someone who has only just signed in and is
-- still role='pending' (not yet approved by an admin), currently has full
-- INSERT/UPDATE/DELETE on all of these tables. Dropping them and, where the
-- existing scoped policy doesn't actually match what the app's UI already
-- allows (is_sme() = super_admin or tnq_team), adding the correct one.

-- activity_log: written by many pages whenever tnq_team/admin makes a
-- change. No page updates or deletes existing rows (Audit Log is read-only),
-- so only INSERT is granted -- keeps the audit trail immutable.
DROP POLICY IF EXISTS "authenticated write activity" ON public.activity_log;
CREATE POLICY "activity_log insert sme" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (is_sme());

-- contributors: managed by tnq_team/admin (any field), and self-service
-- written by the contributor's own onboarding checklist (contributors.id is
-- the same id as the person's own auth/profile id).
DROP POLICY IF EXISTS "authenticated write contributors" ON public.contributors;
CREATE POLICY "contributors write sme" ON public.contributors
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());
CREATE POLICY "contributors write own" ON public.contributors
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "authenticated write learning_paths" ON public.learning_paths;
CREATE POLICY "learning_paths write sme" ON public.learning_paths
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

DROP POLICY IF EXISTS "authenticated write newcomers" ON public.newcomer_resources;
CREATE POLICY "newcomer_resources write sme" ON public.newcomer_resources
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

DROP POLICY IF EXISTS "authenticated write playgrounds" ON public.playgrounds;
CREATE POLICY "playgrounds write sme" ON public.playgrounds
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

-- project_co_owners and project_links already have a correct scoped ALL
-- policy (is_sme(), or admin/sme/project-owner) -- only the dangerous
-- leftover needs to go.
DROP POLICY IF EXISTS "write project_co_owners" ON public.project_co_owners;
DROP POLICY IF EXISTS "authenticated write project_links" ON public.project_links;

-- projects: the existing "projects_sme_write" policy only covers
-- is_admin() OR the specific project's sme_owner_id -- narrower than the
-- app's actual canWrite (any tnq_team/admin can edit any project), so add
-- the broader policy rather than relying on it.
DROP POLICY IF EXISTS "authenticated write projects" ON public.projects;
CREATE POLICY "projects write sme" ON public.projects
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

DROP POLICY IF EXISTS "authenticated write quality" ON public.quality_issues;
CREATE POLICY "quality_issues write sme" ON public.quality_issues
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

DROP POLICY IF EXISTS "authenticated write scores" ON public.quality_scores;
CREATE POLICY "quality_scores write sme" ON public.quality_scores
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

DROP POLICY IF EXISTS "authenticated write quality_sheet" ON public.quality_sheet_config;
CREATE POLICY "quality_sheet_config write sme" ON public.quality_sheet_config
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

-- resource_grants: this is the most sensitive one -- it grants elevated
-- access to a specific project/playground/learning-path/resource. Admin
-- Console-only in the UI; scope it to admins only, not all of is_sme().
DROP POLICY IF EXISTS "authenticated write grants" ON public.resource_grants;
CREATE POLICY "resource_grants write admin" ON public.resource_grants
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "authenticated write resources" ON public.resources;
CREATE POLICY "resources write sme" ON public.resources
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

-- settings already has a correct "settings_admin_write" (is_admin()) policy
-- -- only the leftover blanket one needs to go.
DROP POLICY IF EXISTS "authenticated write settings" ON public.settings;

-- work_log_entries: posting is tnq_team/admin-only and always as yourself;
-- editing/deleting is your own entry, or an admin moderating any entry
-- (matches `isOwn || canModerate` in the Worklog UI, canModerate = isAdmin).
DROP POLICY IF EXISTS "authenticated write worklog" ON public.work_log_entries;
CREATE POLICY "work_log_entries insert own" ON public.work_log_entries
  FOR INSERT TO authenticated WITH CHECK (is_sme() AND user_id = auth.uid());
CREATE POLICY "work_log_entries update own or admin" ON public.work_log_entries
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY "work_log_entries delete own or admin" ON public.work_log_entries
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin());

-- The following five tables had RLS enabled but zero policies at all --
-- not a security hole (default-deny), but it means they're completely
-- non-functional via the API right now. admin_sources backs the live
-- Admin > Sources page; the other four back the not-yet-used contributor
-- "My Playground" / "My Progress" pages.
CREATE POLICY "admin_sources read" ON public.admin_sources
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_sources write admin" ON public.admin_sources
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "contributor_achievements read" ON public.contributor_achievements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "contributor_achievements write sme" ON public.contributor_achievements
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

CREATE POLICY "contributor_progress read" ON public.contributor_progress
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "contributor_progress write sme" ON public.contributor_progress
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());
CREATE POLICY "contributor_progress write own" ON public.contributor_progress
  FOR ALL TO authenticated USING (contributor_id = auth.uid()) WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "playground_content_items read" ON public.playground_content_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "playground_content_items write sme" ON public.playground_content_items
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

CREATE POLICY "playground_documents read" ON public.playground_documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "playground_documents write sme" ON public.playground_documents
  FOR ALL TO authenticated USING (is_sme()) WITH CHECK (is_sme());

NOTIFY pgrst, 'reload schema';
