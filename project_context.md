==========================
PROJECT CONTEXT — DECCAN AI TNQ HUB
==========================

==========================
WHAT THIS PROJECT IS
==========================

Internal management platform for Deccan AI's Training & 
Quality (TnQ) team. Built with:

- Frontend: React + TanStack Start + Vite
- Styling: Tailwind CSS + Framer Motion
- Backend: Supabase (PostgreSQL, Auth, Realtime, Storage)
- Hosting: Vercel (deployed via vercel --prod --force)
- IDE: VS Code
- Local path: C:\Users\Sai Praharsha\Desktop\TnQ
- GitHub repo: extsaipraharsha-create/deccan-tnq-hub
- Live URL: https://deccan-tnq-hub.vercel.app
- Supabase project: pdmwnegijkabaozcmpvy

==========================
CRITICAL DEPLOYMENT RULES
==========================

NEVER change these files — they will break the deployment:
- vite.config.ts
- src/server.ts
- src/integrations/supabase/client.server.ts
- src/integrations/supabase/auth-middleware.ts

Deploy ONLY using:
  npm run build
  vercel --prod --force

Never rely on GitHub auto-deploy — it uses cached builds.

If site breaks, restore with:
  git checkout backup-working-version -- .
  git push --force
  vercel --prod --force

vite.config.ts must stay exactly as:
  import { defineConfig } from "@lovable.dev/vite-tanstack-config";
  export default defineConfig({
    tanstackStart: { server: { entry: "server" } },
    nitro: { preset: "vercel" },
    vite: { ssr: { noExternal: true } },
  });

==========================
USER ROLES — 4 TIERS
==========================

super_admin — full access, orange sidebar accent
tnq_team (SME) — own projects/contributors, teal accent
contributor — own learning/scores only, blue accent
pending — awaiting role assignment

Roles stored in Supabase: public.user_roles table
To approve a new user run in Supabase SQL Editor:
  INSERT INTO public.user_roles (user_id, role, status)
  VALUES ('their-uuid', 'tnq_team', 'active')
  ON CONFLICT (user_id) DO UPDATE SET role = 'tnq_team', status = 'active';

==========================
SUPABASE TABLES
==========================

profiles — user profiles (id, name, email, photo_url)
user_roles — roles (user_id, role, status)
projects — AI projects (name, given_name, domain, status, 
           audience_type, version, sme_owner_id, 
           current_owner_ids, emoji_icon, tasking_live,
           user_analytics_url)
project_co_owners — co-owners per project (project_id, 
                    user_id, working_on)
project_links — links per project (project_id, link_type, 
                label, url)
learning_paths — learning path items (project_id, name, 
                 version, is_live, user_url, production_url)
playgrounds — playground items (project_id, name, version,
              is_live, playground_url, content_url, 
              dashboard_url, playground_id)
contributors — contributor records (sme_id, projects array,
               onboarding_status, learning_path_id)
contributor_progress — module completion tracking
quality_issues — quality issues (contributor_id, project_id,
                 status open/resolved)
quality_scores — scores per contributor per project
quality_sheet_config — linked Google Sheet for quality sync
work_log_entries — team work log (user_id, content, 
                   project_id, entry_type, priority P0-P3)
resources — team resources (name, category, url, tags)
newcomer_resources — newcomer docs per project
activity_log — audit trail of all actions
settings — site settings (announcement, maintenance_mode)

==========================
FILE STRUCTURE
==========================

src/routes/
  login.tsx — public login page
  pending.tsx — access pending page
  suspended.tsx — suspended user page
  index.tsx — redirects based on role
  _app.tsx — authenticated layout wrapper
  _app/
    dashboard.tsx — role-based dashboard
    projects.tsx — all projects list
    projects.$id.tsx — project detail with tabs
    worklog.tsx — team work log table
    learning.tsx — workspace (playgrounds + learning paths)
    quality.tsx — quality tracker with Google Sheet sync
    resources.tsx — resources hub
    team.tsx — team directory
    contributors.tsx — contributor management
    newcomers.tsx — newcomer resources
    onboarding.tsx — onboarding monitor
    my-learning.tsx — contributor learning path
    my-playground.tsx — contributor playground
    my-progress.tsx — contributor progress
    my-projects.tsx — contributor projects
    my-scores.tsx — contributor scores
    guide.tsx — user guide (needs to be in _app/ folder)
    admin/
      users.tsx — user management
      grants.tsx — resource grants
      announcements.tsx — site announcements
      sources.tsx — password-protected sources
      audit.tsx — audit log
      settings.tsx — admin settings

src/components/tnq/
  Sidebar.tsx — role-based navigation sidebar
  Topbar.tsx — top navigation bar
  AppShell.tsx — main layout shell
  ui.tsx — shared UI components
  GuidedTour.tsx — interactive product tour

src/integrations/supabase/
  client.ts — browser Supabase client
  client.server.ts — server Supabase client (DO NOT EDIT)
  auth-middleware.ts — auth middleware (DO NOT EDIT)
  types.ts — generated Supabase types

==========================
SIDEBAR NAVIGATION
==========================

contributor: Dashboard, My Learning Path, My Playground,
             My Progress, My Projects, My Scores, Resources,
             Newcomers

tnq_team: Dashboard, Work Log, My Projects, Quality Reviews,
          Onboarding, Newcomers, Team Directory, Contributors,
          Workspace, Resources

super_admin: Dashboard, All Projects, Work Log, Workspace,
             Quality Overview, Newcomers, Team Directory,
             Contributor Management, Resources,
             ADMIN CONSOLE (Users & Roles, Resource Grants,
             Announcements, Sources, Audit Log, Settings)

All roles have Start Tour button at sidebar bottom.
Tour listens for: window.dispatchEvent(new Event("tnq:tour_start"))

==========================
CURRENT KNOWN ISSUES / IN PROGRESS
==========================

1. dashboard.tsx has syntax error — Dashboard function 
   wrapping missing. Code is outside function after 
   Route export. Build fails with "return outside function"
   
   Fix: Wrap lines after Route export in:
   function Dashboard() { ... }

2. Admin dashboard still shows "Onboarding %" and 
   "Avg quality" stat cards — need to replace with 
   "Open issues" and "Pending users"

3. Contributor dashboard still shows "Onboarding %" 
   stat card — replace with "Active projects"

4. project_co_owners UI not yet added to projects.$id.tsx
   Table exists in Supabase, needs UI in Overview tab

5. Guide page at src/routes/guide.tsx needs to be moved to
   src/routes/_app/guide.tsx to show inside authenticated 
   layout with sidebar

6. GuidedTour component created at 
   src/components/tnq/GuidedTour.tsx
   needs to be imported in src/routes/_app.tsx

7. User Guide link in sidebar points to /guide —
   should be removed and replaced with Start Tour button
   (Start Tour button already exists in sidebar)

==========================
RECENT FEATURES ADDED
==========================

Work Log (/worklog):
  - Priority field P0/P1/P2/P3 (P0=red/critical)
  - Grouped by Person toggle vs Chronological view
  - Realtime updates via Supabase channel
  - Priority filter in filter bar
  - P0 entries get red left border

Dashboard:
  - Quality by Project table (all roles, filtered by role)
  - Pending Actions widget (admin shows pending users)
  - Role-based hero messages
  - Daily dose rotating quotes

Projects:
  - Audience type, version, tasking_live fields
  - Co-owners table exists (UI pending)
  - Project links (playground, learning path, docs URLs)
  - Workspace tab planned for project detail

Quality Tracker:
  - Google Sheet embed via iframe
  - CSV sync for live stats
  - Progress cards (completion %, avg score, active count)
  - Auto-refresh every 5 minutes

==========================
GIT BRANCHES / TAGS
==========================

main — production branch
backup-working-version — safe backup before new features
v2.0-before-new-features — tagged backup

Latest working commit: check with git log --oneline -5

==========================
HOW TO DEPLOY
==========================

1. Make changes in VS Code
2. npm run build (must succeed before deploying)
3. vercel --prod --force
4. Check https://deccan-tnq-hub.vercel.app

If auto-deploy from GitHub push breaks things:
  vercel --prod --force (redeploys local build)

==========================
HOW TO ADD NEW USERS
==========================

1. User signs in with @deccan.ai Google account
2. They see "Access Pending" screen
3. Go to Supabase → SQL Editor → run:

INSERT INTO public.user_roles (user_id, role, status)
VALUES ('paste-their-uuid-here', 'tnq_team', 'active')
ON CONFLICT (user_id) DO UPDATE SET role = 'tnq_team';

Find UUID with:
SELECT id, email FROM auth.users;

Roles: super_admin / tnq_team / contributor

==========================
WHAT TO TELL CLAUDE NEXT
==========================

When starting a new chat paste this entire document.
Then describe what you need help with.

Current immediate tasks:
1. Fix dashboard.tsx syntax error (return outside function)
2. Remove Onboarding % cards from admin and contributor dash
3. Move guide.tsx to _app/guide.tsx
4. Import GuidedTour in _app.tsx
5. Add co-owners UI to projects.$id.tsx Overview tab
