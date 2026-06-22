import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/tnq/auth-context";
import { ROLE_LABEL } from "@/lib/tnq/constants";
import { Sparkles, Shield } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "DASHBOARD",
  "/my-learning": "MY LEARNING",
  "/my-playground": "MY PLAYGROUND",
  "/my-progress": "MY PROGRESS",
  "/my-projects": "MY PROJECTS",
  "/my-scores": "MY SCORES",
  "/projects": "ALL PROJECTS",
  "/contributors": "CONTRIBUTOR MANAGEMENT",
  "/quality": "QUALITY OVERVIEW",
  "/onboarding": "ONBOARDING",
  "/learning": "WORKSPACE",
  "/resources": "RESOURCES",
  "/team": "TEAM DIRECTORY",
  "/admin/users": "USERS & ROLES",
  "/admin/grants": "RESOURCE GRANTS",
  "/admin/announcements": "ANNOUNCEMENTS",
  "/admin/sources": "SOURCES",
  "/admin/audit": "AUDIT LOG",
  "/admin/settings": "SETTINGS",
  "/worklog": "WORK LOG",
};

export function Topbar() {
  const { role } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = TITLES[pathname] ?? "TNQ HUB";

  return (
    <header className="h-[68px] sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border flex items-center justify-between gap-4 px-8">
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="font-mono text-sm font-bold tracking-[0.2em] text-foreground truncate">
          {title}
        </h1>
        <span className="text-border">|</span>
        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
          TNQ_HUB_V1.0
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full border border-border bg-card text-sm text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">Quick jump</span>
          <kbd className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/60 text-foreground">
            ⌘K
          </kbd>
        </div>

        {role && (
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-full font-mono text-[11px] font-bold tracking-[0.15em] text-white bg-primary shadow-soft">
            <Shield className="h-3.5 w-3.5" />
            {ROLE_LABEL[role]}
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-white/90" />
          </div>
        )}
      </div>
    </header>
  );
}
