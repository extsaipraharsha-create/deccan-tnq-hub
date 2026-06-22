import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  TrendingUp,
  FolderKanban,
  Award,
  Library,
  Users,
  Users2,
  ClipboardCheck,
  Activity,
  Shield,
  FileText,
  Megaphone,
  Lock,
  ScrollText,
  Settings,
  LogOut,
  Diamond,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";
import { ROLE_LABEL, ROLE_ACCENT } from "@/lib/tnq/constants";
import type { AppRole } from "@/lib/tnq/types";

type NavItem = { label: string; to: string; icon: any };
type NavSection = { label: string; items: NavItem[]; admin?: boolean };

const NAV: Record<AppRole, NavSection[]> = {
  contributor: [
    { label: "OVERVIEW", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }] },
    {
      label: "MY LEARNING",
      items: [
        { label: "My Learning Path", to: "/my-learning", icon: BookOpen },
        { label: "My Playground", to: "/my-playground", icon: FlaskConical },
        { label: "My Progress", to: "/my-progress", icon: TrendingUp },
      ],
    },
    {
      label: "MY WORK",
      items: [
        { label: "My Projects", to: "/my-projects", icon: FolderKanban },
        { label: "My Scores", to: "/my-scores", icon: Award },
      ],
    },
    {
      label: "CONTENT",
      items: [
        { label: "Resources", to: "/resources", icon: Library },
        { label: "Newcomers", to: "/newcomers", icon: GraduationCap },
      ],
    },
  ],
  tnq_team: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { label: "Work Log", to: "/worklog", icon: MessageSquare },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        { label: "My Projects", to: "/projects", icon: FolderKanban },
        { label: "Quality Reviews", to: "/quality", icon: ClipboardCheck },
        { label: "Onboarding", to: "/onboarding", icon: Activity },
        { label: "Newcomers", to: "/newcomers", icon: GraduationCap },
      ],
    },
    {
      label: "TEAM MANAGEMENT",
      items: [
        { label: "Team Directory", to: "/team", icon: Users2 },
        { label: "Contributors", to: "/contributors", icon: Users },
      ],
    },
    {
      label: "CONTENT",
      items: [
        { label: "Workspace", to: "/learning", icon: BookOpen },
        { label: "Resources", to: "/resources", icon: Library },
      ],
    },
  ],
  super_admin: [
    { label: "OVERVIEW", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }] },
    {
      label: "OPERATIONS",
      items: [
        { label: "All Projects", to: "/projects", icon: FolderKanban },
        { label: "Work Log", to: "/worklog", icon: MessageSquare },
        { label: "Workspace", to: "/learning", icon: BookOpen },
        { label: "Quality Overview", to: "/quality", icon: ClipboardCheck },
        { label: "Newcomers", to: "/newcomers", icon: GraduationCap },
      ],
    },
    {
      label: "TEAM MANAGEMENT",
      items: [
        { label: "Team Directory", to: "/team", icon: Users2 },
        { label: "Contributor Management", to: "/contributors", icon: Users },
      ],
    },
    { label: "CONTENT", items: [{ label: "Resources", to: "/resources", icon: Library }] },
    {
      label: "ADMIN CONSOLE",
      admin: true,
      items: [{ label: "Admin Panel", to: "/admin/users", icon: Settings }],
    },
  ],
  pending: [],
};

const ADMIN_SUB: NavItem[] = [
  { label: "Users & Roles", to: "/admin/users", icon: Shield },
  { label: "Resource Grants", to: "/admin/grants", icon: FileText },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
  { label: "Sources", to: "/admin/sources", icon: Lock },
  { label: "Audit Log", to: "/admin/audit", icon: ScrollText },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const { role, profile, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const effRole: AppRole = role && role !== "pending" ? role : "contributor";
  const sections = NAV[effRole];
  const accent = ROLE_ACCENT[effRole];
  const initials = (profile?.name ?? profile?.email ?? "?").slice(0, 1).toUpperCase();
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith("/admin"));

  return (
    <aside className="w-[260px] shrink-0 flex flex-col bg-surface border-r border-border h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center">
          <Diamond className="h-5 w-5 text-primary" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[13px] font-bold tracking-[0.14em] text-foreground leading-tight">
            DECCAN AI
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            TNQ HUB
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {sections.map((section) =>
          section.admin ? (
            <div key={section.label}>
              <button
                onClick={() => setAdminOpen((s) => !s)}
                className="w-full flex items-center justify-between px-2 mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-primary uppercase"
              >
                {section.label}
                <span className="text-muted-foreground">{adminOpen ? "−" : "+"}</span>
              </button>
              {adminOpen && (
                <div className="space-y-0.5">
                  {ADMIN_SUB.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/70 hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div key={section.label}>
              <div className="px-2 mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </nav>

      <div className="border-t border-border p-3 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: accent }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">
            {profile?.name ?? profile?.email}
          </div>
          <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {ROLE_LABEL[effRole]}
          </div>
        </div>
        <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
