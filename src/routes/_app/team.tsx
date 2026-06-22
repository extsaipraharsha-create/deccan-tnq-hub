import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, Input, Badge, EmptyState, Button } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users } from "lucide-react";

type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type RoleRow = { user_id: string; role: string; status: string };
type Project = {
  id: string;
  name: string;
  given_name: string | null;
  emoji_icon: string | null;
  audience_type: string | null;
  version: string | null;
  status: "active" | "paused" | "completed";
  sme_owner_id: string | null;
  current_owner_ids: string[] | null;
  previous_owner_ids: string[] | null;
};

const STATUS_TONE: Record<string, "success" | "warn" | "default"> = {
  active: "success",
  paused: "warn",
  completed: "default",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Live",
  paused: "Planning",
  completed: "Inactive",
};

type FilterKey = "all" | "active" | "paused" | "completed";

function TeamPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: r }, { data: pr }] = await Promise.all([
        supabase.from("profiles").select("id,name,email,photo_url"),
        supabase.from("user_roles").select("user_id,role,status"),
        supabase.from("projects").select("*"),
      ]);
      setProfiles((p as any) ?? []);
      setRoles((r as any) ?? []);
      setProjects((pr as any) ?? []);
      setLoading(false);
    })();
  }, []);

  // SME = tnq_team or super_admin
  const smes = useMemo(() => {
    const smeIds = new Set(
      roles.filter((r) => r.role === "super_admin" || r.role === "tnq_team").map((r) => r.user_id),
    );
    return profiles.filter((p) => smeIds.has(p.id));
  }, [profiles, roles]);

  // For each SME, gather their projects (sme_owner_id OR in current_owner_ids)
  const rows = useMemo(() => {
    return smes
      .map((sme) => {
        let projs = projects.filter(
          (p) => p.sme_owner_id === sme.id || (p.current_owner_ids ?? []).includes(sme.id),
        );
        if (filter !== "all") projs = projs.filter((p) => p.status === filter);
        return { sme, projects: projs };
      })
      .filter((row) => {
        if (filter !== "all" && row.projects.length === 0) return false;
        if (!q.trim()) return true;
        const t = q.toLowerCase();
        return (
          (row.sme.name ?? "").toLowerCase().includes(t) ||
          (row.sme.email ?? "").toLowerCase().includes(t) ||
          row.projects.some((p) => p.name.toLowerCase().includes(t))
        );
      });
  }, [smes, projects, filter, q]);

  const TABS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "ALL SMES" },
    { key: "active", label: "LIVE" },
    { key: "paused", label: "PLANNING" },
    { key: "completed", label: "INACTIVE" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${
                filter === t.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SME or project…"
            className="w-72 pl-8"
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Users className="h-10 w-10" />} title="No SMEs to show" />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  <th className="text-left px-5 py-3">SME</th>
                  <th className="text-left px-3 py-3">Projects</th>
                  <th className="text-left px-3 py-3">Audience</th>
                  <th className="text-left px-3 py-3">Version</th>
                  <th className="text-left px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ sme, projects: projs }) => {
                  const init = (sme.name ?? sme.email ?? "?").slice(0, 1).toUpperCase();
                  return (
                    <tr key={sme.id} className="hover:bg-accent/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {sme.photo_url ? (
                            <img src={sme.photo_url} alt="" className="h-8 w-8 rounded-full" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                              {init}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-foreground">{sme.name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{sme.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {projs.length === 0 ? (
                          <span className="text-xs text-muted-foreground">— None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {projs.map((p) => (
                              <Link
                                key={p.id}
                                to="/projects/$id"
                                params={{ id: p.id }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 hover:bg-foreground hover:text-background text-xs font-medium transition-colors"
                              >
                                <span>{p.emoji_icon ?? "📁"}</span>
                                {p.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {projs.map((p) => (
                            <Badge key={p.id} tone="info">
                              {p.audience_type ?? "N/A"}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 font-mono text-xs text-foreground">
                          {projs.map((p) => (
                            <span key={p.id} className="px-1.5 py-0.5 bg-muted/60 rounded">
                              {p.version ?? "—"}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {projs.map((p) => (
                            <Badge key={p.id} tone={STATUS_TONE[p.status]}>
                              {STATUS_LABEL[p.status]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/team")({ component: TeamPage });
