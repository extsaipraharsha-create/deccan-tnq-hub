/* eslint-disable prettier/prettier */
 
 
import { createFileRoute } from "@tanstack/react-router";
import { Card, Badge, Button } from "@/components/tnq/ui";
import {
  BookOpen,
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  GraduationCap,
  Search,
  FileText,
  Shield,
  Users,
  ClipboardCheck,
  Activity,
  ExternalLink,
  FlaskConical,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";

const IconBadgeText = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2">{children}</span>
);

const DashboardIcon = LayoutDashboard;

function HintIcon({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-sm text-muted-foreground">{children}</div>;
}

function KeyTips({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
      <div className="font-mono text-xs font-bold tracking-[0.18em] text-sky-900 uppercase">
        {title}
      </div>
      <div className="mt-2 text-sm text-sky-950/80">{children}</div>
    </div>
  );
}

function Diagram({ variant }: { variant: "dashboard" | "worklog" | "projects" }) {
  const map: Record<string, string> = {
    dashboard:
      "<div class='flex gap-2'><span class='px-2 py-1 rounded-lg bg-foreground text-background text-xs font-mono'>You</span><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Stats</span><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Actions</span></div>",
    worklog:
      "<div class='flex gap-2'><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Post</span><span class='px-2 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-mono'>Priority</span><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Filter</span></div>",
    projects:
      "<div class='flex gap-2'><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Co-owners</span><span class='px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-mono'>Workspace</span><span class='px-2 py-1 rounded-lg bg-muted text-xs font-mono'>Quality</span></div>",
  };

  // Keep this simple: static HTML is fine here (no user input)
  return (
    <div className="mt-3" dangerouslySetInnerHTML={{ __html: map[variant] }} />
  );
}

function Section({
  id,
  title,
  subtitle,
  icon,
  children,
  adminOnly,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { role } = useAuth();
  if (adminOnly && role !== "super_admin") return null;
  const Icon = icon;
  return (
    <section id={id} className="scroll-mt-24">
      <Card className="p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </div>
          {adminOnly && <Badge tone="info">Admin</Badge>}
        </div>
        {children}
      </Card>
    </section>
  );
}

const TOC = [
  {
    group: "Getting Started",
    items: [
      { id: "getting-started", label: "What is TnQ Hub" },
      { id: "sign-in", label: "How to sign in" },
      { id: "roles", label: "Understanding your role" },
    ],
  },
  {
    group: "Dashboard",
    items: [
      { id: "dashboard", label: "Overview" },
      { id: "pending-actions", label: "Pending actions" },
      { id: "quick-resources", label: "Quick resources widget" },
      { id: "activity-feed", label: "Activity feed" },
    ],
  },
  {
    group: "Projects",
    items: [
      { id: "projects", label: "Viewing projects" },
      { id: "project-details", label: "Opening project details" },
      { id: "project-links", label: "Project links & tabs" },
      { id: "co-owners", label: "Co-owners and roles" },
    ],
  },
  {
    group: "Learning & Workspace",
    items: [
      { id: "playground", label: "Playground tab" },
      { id: "learning-path", label: "Learning Path tab" },
      { id: "versions", label: "How versions work" },
      { id: "badges", label: "What status badges mean" },
    ],
  },
  {
    group: "Quality Tracker",
    items: [{ id: "quality", label: "Linking & reading quality" }, { id: "profiles", label: "Contributor quality profiles" }],
  },
  {
    group: "Work Log",
    items: [
      { id: "worklog", label: "Posting updates" },
      { id: "priority", label: "Priority levels (P0–P3)" },
      { id: "filters", label: "Filtering & searching" },
      { id: "grouped", label: "Grouped vs chronological view" },
    ],
  },
  {
    group: "Resources",
    items: [
      { id: "resources", label: "Uploading vs links" },
      { id: "resource-visibility", label: "Who can see what" },
      { id: "categories", label: "Categories explained" },
    ],
  },
  {
    group: "Admin Guide",
    items: [{ id: "admin", label: "Admin Guide" }],
    adminOnly: true,
  },
];

function GuidePage() {
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
              User Guide
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Built-in interactive guide</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <Card className="lg:sticky lg:top-24 self-start p-4">
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase mb-3">
            Table of Contents
          </div>
          <div className="space-y-4">
            {TOC.filter((g) => !g.adminOnly || role === "super_admin").map((group) => (
              <div key={group.group}>
                <div className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((it) => (
                    <a
                      key={it.id}
                      href={`#${it.id}`}
                      className="block text-sm text-foreground/80 hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {it.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <Section
            id="getting-started"
            title="What is TnQ Hub"
            subtitle="A single place to manage learning, projects, quality, and work log updates."
            icon={Sparkles}
          >
            <HintIcon>
              <span aria-hidden>💡</span> TnQ Hub combines your workflow into one consistent UI.
            </HintIcon>
            <KeyTips title="Key tip">
              Use the left sidebar on this page to jump between topics quickly.
            </KeyTips>
            <Diagram variant="dashboard" />
          </Section>

          <Section
            id="sign-in"
            title="How to sign in"
            subtitle="Your role determines what you can do."
            icon={Shield}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Sign in using your account. After login, your sidebar and dashboards will adapt to
              your assigned role.
            </p>
            <KeyTips title="Key tip">If you don’t see expected features, ask an admin to confirm your role.</KeyTips>
          </Section>

          <Section
            id="roles"
            title="Understanding your role"
            subtitle="Contributor / SME / Admin — each role has a different focus."
            icon={Users}
          >
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>📌 <b>Contributor</b>: learning path & playground work, posting updates in Work Log.</li>
              <li>🧩 <b>SME</b>: quality reviews, contributor guidance, and project oversight.</li>
              <li>🛠️ <b>Admin</b>: user management, approvals, announcements, audit logs.</li>
            </ul>
            <KeyTips title="Key tip">Your dashboard shows the next most relevant actions for your role.</KeyTips>
          </Section>

          <Section
            id="dashboard"
            title="Dashboard"
            subtitle="Read the stat cards, activity feed, and pending actions."
            icon={DashboardIcon}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Stat cards summarize progress. Pending Actions help you resolve blockers quickly.
            </p>
            <Diagram variant="dashboard" />
          </Section>

          <Section
            id="pending-actions"
            title="Pending actions"
            subtitle="Triage tasks that need attention right now."
            icon={ClipboardCheck}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Super Admin sees pending approvals. SMEs see contributor work blockers, and contributors
              see learning/attempt tasks.
            </p>
            <KeyTips title="Key tip">
              Each item is clickable and takes you directly to the correct place.
            </KeyTips>
          </Section>

          <Section
            id="quick-resources"
            title="Quick resources widget"
            subtitle="Last 5 resources from the Resources Hub."
            icon={FileText}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Use the floating widget on the right side to open resources without leaving your dashboard.
            </p>
          </Section>

          <Section
            id="activity-feed"
            title="Activity feed"
            subtitle="See key updates from across the platform."
            icon={Activity}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Realtime updates keep the feed fresh so you don’t have to refresh pages.
            </p>
          </Section>

          <Section
            id="projects"
            title="Viewing projects"
            subtitle="Browse the project list and open details for deeper information."
            icon={FolderKanban}
          >
            <KeyTips title="Key tip">Hover project cards to quickly scan co-owners.</KeyTips>
          </Section>

          <Section
            id="project-details"
            title="Opening project details (tabs explained)"
            subtitle="Overview, Links, Workspace, Contributors, Quality, Activity."
            icon={BookOpen}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              The Project detail page is organized into tabs so you can focus on the task at hand.
            </p>
          </Section>

          <Section
            id="project-links"
            title="Project links (Playground / Learning Path / Docs)"
            subtitle="Every project can store external links."
            icon={ExternalLink}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Open links in a new tab for convenience.
            </p>
          </Section>

          <Section
            id="co-owners"
            title="Co-owners and their roles"
            subtitle="Co-owners collaborate on the same project."
            icon={Users}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Co-owners are shown in the Overview and on project cards. Each co-owner has a note describing what they’re working on.
            </p>
          </Section>

          <Section
            id="playground"
            title="Playground tab explained"
            subtitle="Track playground tasks and versions."
            icon={FlaskConical}
          >
            <KeyTips title="Key tip">Use “Live” status to identify the current working version.</KeyTips>
          </Section>

          <Section
            id="learning-path"
            title="Learning Path tab explained"
            subtitle="Structured learning progress for contributors."
            icon={GraduationCap}
          >
            <Diagram variant="projects" />
          </Section>

          <Section
            id="versions"
            title="How versions work"
            subtitle="You can have multiple versions; the “Live” one is active."
            icon={Sparkles}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Versions let teams evolve content safely while keeping production stable.
            </p>
          </Section>

          <Section
            id="badges"
            title="What the status badges mean"
            subtitle="Badges quickly communicate Live/Planning/Inactive states."
            icon={Shield}
          >
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>✅ <b>Live</b>: current operational state.</li>
              <li>🟡 <b>Planning</b>: not yet deployed.</li>
              <li>⚪ <b>Inactive</b>: not active anymore.</li>
            </ul>
          </Section>

          <Section
            id="quality"
            title="How to link a Google Sheet"
            subtitle="Quality Tracker connects contributors’ work to measurable progress."
            icon={ClipboardCheck}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Link the sheet from the Quality tracker page. SMEs review quality issues and track them.
            </p>
          </Section>

          <Section
            id="profiles"
            title="Contributor quality profiles"
            subtitle="See quality trends per contributor and project."
            icon={Trophy}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Profiles highlight what’s improving and where additional reviews are needed.
            </p>
          </Section>

          <Section
            id="worklog"
            title="How to post an update"
            subtitle="Write a short status note and optionally connect it to a project."
            icon={MessageSquare}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Use Work Log to communicate progress and blockers.
            </p>
            <Diagram variant="worklog" />
          </Section>

          <Section
            id="priority"
            title="Priority levels (P0–P3)"
            subtitle="Critical issues should be unmistakable."
            icon={Sparkles}
          >
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>🔥 <b>P0</b> — Critical</li>
              <li>🟠 <b>P1</b> — High</li>
              <li>🟡 <b>P2</b> — Medium</li>
              <li>⚪ <b>P3</b> — Low</li>
            </ul>
          </Section>

          <Section
            id="filters"
            title="Filtering and searching"
            subtitle="Find exactly what you need in seconds."
            icon={Search}
          >
            <KeyTips title="Key tip">Use the filter bar and search content text.</KeyTips>
          </Section>

          <Section
            id="grouped"
            title="Grouped vs chronological view"
            subtitle="Switch between a per-person grouped view and a chronological list."
            icon={FolderKanban}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Grouped view makes it easier to scan what each person posted.
            </p>
          </Section>

          <Section
            id="resources"
            title="Uploading files vs pasting links"
            subtitle="Resources can be shared as files or external URLs."
            icon={FileText}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Resources are organized by category, and visibility depends on role.
            </p>
          </Section>

          <Section
            id="resource-visibility"
            title="Who can see what"
            subtitle="Visibility is role-based."
            icon={Shield}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Some items are visible to contributors, others are internal to SMEs or admin.
            </p>
          </Section>

          <Section
            id="categories"
            title="Categories explained"
            subtitle="External links, project docs, templates, and more."
            icon={BookOpen}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              Categories help you quickly find the right resource type.
            </p>
          </Section>

          <Section
            id="admin"
            title="Admin Guide"
            subtitle="Managing users, approvals, announcements, and audit logs."
            icon={Shield}
            adminOnly
          >
            <div className="space-y-3 text-sm text-foreground/80">
              <p>
                • Managing users and roles
              </p>
              <p>
                • Approving pending users (see Admin → Users)
              </p>
              <p>
                • Managing announcements
              </p>
              <p>
                • Reading audit logs
              </p>
            </div>
            <KeyTips title="Key tip">
              Use audit logs to trace changes and approvals.
            </KeyTips>
          </Section>

          <div className="mt-8 text-xs text-muted-foreground">
            Tip: Use the TOC to jump to any section.
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/guide")({ component: GuidePage });
