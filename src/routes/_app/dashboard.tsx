import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FlaskConical,
  FolderKanban,
  Award,
  Users,
  ClipboardCheck,
  Activity,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, StatCard, EmptyState, StatusPill, Badge } from "@/components/tnq/ui";
import { pickDailyDose, greeting, ROLE_LABEL } from "@/lib/tnq/constants";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { role, profile } = useAuth();
  const firstName = (profile?.name ?? profile?.email ?? "there").split(/[ @]/)[0];
  const dose = useMemo(() => pickDailyDose(profile?.id), [profile?.id]);

  const heroTitle =
    role === "super_admin"
      ? "Platform control center."
      : role === "tnq_team"
        ? "Your team at a glance."
        : "Your learning journey.";

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-primary italic text-lg">
          {greeting()}, {firstName}.
        </div>
        <h1 className="mt-1 text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
          {heroTitle}
        </h1>
      </div>

      {role === "contributor" && <ContributorDash dose={dose} />}
      {role === "tnq_team" && <SmeDash dose={dose} />}
      {role === "super_admin" && <AdminDash dose={dose} />}

      <QualityByProject role={role} />
    </div>
  );
}

/* ------------ QUALITY BY PROJECT (all roles) ------------ */
type QProj = {
  id: string;
  name: string;
  status: string;
  audience_type: string | null;
  version: string | null;
  tasking_live: boolean;
  sme_owner_id: string | null;
  emoji_icon: string | null;
  current_owner_ids: string[] | null;
};
function QualityByProject({ role }: { role: string | null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<QProj[]>([]);
  const [scoresByProj, setScoresByProj] = useState<Record<string, number[]>>({});
  const [mineByProj, setMineByProj] = useState<Record<string, number[]>>({});
  const [profiles, setProfiles] = useState<
    { id: string; name: string | null; email: string | null }[]
  >([]);

  useEffect(() => {
    (async () => {
      const { data: ps } = await supabase
        .from("projects")
        .select(
          "id,name,status,audience_type,version,tasking_live,sme_owner_id,emoji_icon,current_owner_ids",
        );
      const { data: sc } = await supabase
        .from("quality_scores")
        .select("project_id,contributor_id,score");
      const { data: profs } = await supabase.from("profiles").select("id,name,email");
      const byProj: Record<string, number[]> = {};
      const byMine: Record<string, number[]> = {};
      (sc ?? []).forEach((s: any) => {
        if (!s.project_id) return;
        (byProj[s.project_id] ||= []).push(Number(s.score));
        if (s.contributor_id === user?.id) (byMine[s.project_id] ||= []).push(Number(s.score));
      });
      setProjects((ps as any) ?? []);
      setScoresByProj(byProj);
      setMineByProj(byMine);
      setProfiles((profs as any) ?? []);
    })();
  }, [user?.id]);

  const visible = useMemo(() => {
    if (role === "tnq_team")
      return projects.filter(
        (p) => p.sme_owner_id === user?.id || (p.current_owner_ids ?? []).includes(user?.id ?? ""),
      );
    if (role === "contributor") return projects.filter((p) => (mineByProj[p.id]?.length ?? 0) > 0);
    return projects;
  }, [projects, role, user?.id, mineByProj]);

  function rowTone(p: QProj, avg: number | null): string {
    if (!p.tasking_live) return "bg-muted/40";
    if (avg == null) return "";
    if (avg >= 80) return "bg-emerald-50";
    if (avg >= 60) return "bg-amber-50";
    return "bg-rose-50";
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
          Quality by project
        </div>
        <Link
          to="/quality"
          className="font-mono text-[11px] tracking-wider text-primary uppercase hover:underline"
        >
          Open tracker →
        </Link>
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No projects to show" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground border-b border-border">
                <th className="text-left py-2">Project</th>
                <th className="text-left py-2">Audience</th>
                <th className="text-left py-2">Ver</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Tasking</th>
                <th className="text-left py-2">Owner</th>
                <th className="text-left py-2">
                  {role === "contributor" ? "My Score" : "Avg Score"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((p) => {
                const arr = role === "contributor" ? mineByProj[p.id] : scoresByProj[p.id];
                const avg = arr?.length
                  ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
                  : null;
                const owner = profiles.find((x) => x.id === p.sme_owner_id);
                return (
                  <tr
                    key={p.id}
                    onClick={() =>
                      navigate({
                        to: "/projects/$id",
                        params: { id: p.id },
                        search: { tab: "quality" } as any,
                      })
                    }
                    className={`cursor-pointer hover:opacity-90 ${rowTone(p, avg)}`}
                  >
                    <td className="py-2.5 font-medium text-foreground">
                      {p.emoji_icon ?? "📁"} {p.name}
                    </td>
                    <td className="py-2.5">
                      <Badge tone="info">{p.audience_type ?? "N/A"}</Badge>
                    </td>
                    <td className="py-2.5 font-mono text-xs">{p.version ?? "—"}</td>
                    <td className="py-2.5">
                      <Badge
                        tone={
                          p.status === "active"
                            ? "success"
                            : p.status === "paused"
                              ? "warn"
                              : "default"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${p.tasking_live ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                      >
                        {p.tasking_live ? "YES" : "NO"}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{owner?.name ?? "—"}</td>
                    <td className="py-2.5 font-mono font-bold">
                      {avg != null ? avg.toFixed(1) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ---------------- CONTRIBUTOR ---------------- */
function ContributorDash({ dose }: { dose: string }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ done: 0, total: 0, lastScore: 0, projectCount: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prog }, { data: scores }, { data: contrib }] = await Promise.all([
        supabase.from("contributor_progress").select("status").eq("contributor_id", user.id),
        supabase
          .from("quality_scores")
          .select("score")
          .eq("contributor_id", user.id)
          .order("review_date", { ascending: false })
          .limit(1),
        supabase.from("contributors").select("projects").eq("id", user.id).maybeSingle(),
      ]);
      setStats({
        done: prog?.filter((p) => p.status === "complete").length ?? 0,
        total: prog?.length ?? 0,
        lastScore: scores?.[0]?.score ?? 0,
        projectCount: contrib?.projects?.length ?? 0,
      });
    })();
  }, [user]);

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <>
      <StatusPill
        items={[
          { label: "Backend connected", tone: "ok" },
          { label: `${pct}% onboarding complete`, tone: pct >= 50 ? "ok" : "warn" },
          {
            label: `${stats.projectCount} active project${stats.projectCount === 1 ? "" : "s"}`,
            tone: "ok",
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Modules done" value={stats.done} suffix={`of ${stats.total}`} />
        <StatCard label="Onboarding %" value={pct} suffix="percent" />
        <StatCard label="Last score" value={stats.lastScore || "0.0"} suffix="/100" />
        <StatCard label="Projects" value={stats.projectCount} suffix="assigned" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
              My learning path
            </div>
            <Link
              to="/my-learning"
              className="font-mono text-[11px] tracking-wider text-primary uppercase hover:underline"
            >
              Continue →
            </Link>
          </div>
          {stats.total === 0 ? (
            <EmptyState
              title="No learning path yet"
              subtitle="Your SME hasn't assigned a Learning Path yet."
              icon={<BookOpen className="h-8 w-8" />}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              Your structured learning journey awaits.
            </div>
          )}
        </Card>
        <Card>
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3">
            Daily dose
          </div>
          <p className="text-sm italic text-foreground/80 leading-relaxed">"{dose}"</p>
        </Card>
      </div>
    </>
  );
}

/* ---------------- SME ---------------- */
function SmeDash({ dose }: { dose: string }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, contributors: 0, openIssues: 0, avgScore: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: projCount }, { data: contribs }] = await Promise.all([
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("sme_owner_id", user.id),
        supabase.from("contributors").select("id").eq("sme_id", user.id),
      ]);
      const ids = (contribs ?? []).map((c) => c.id);
      let openIssues = 0,
        avg = 0;
      if (ids.length) {
        const { count: ic } = await supabase
          .from("quality_issues")
          .select("id", { count: "exact", head: true })
          .in("contributor_id", ids)
          .eq("status", "open");
        openIssues = ic ?? 0;
        const { data: sc } = await supabase
          .from("quality_scores")
          .select("score")
          .in("contributor_id", ids);
        if (sc?.length)
          avg = Math.round((sc.reduce((a, b) => a + Number(b.score), 0) / sc.length) * 10) / 10;
      }
      setStats({ projects: projCount ?? 0, contributors: ids.length, openIssues, avgScore: avg });
    })();
  }, [user]);

  return (
    <>
      <StatusPill
        items={[
          { label: "Backend connected", tone: "ok" },
          { label: `${stats.contributors} contributors`, tone: "ok" },
          { label: `${stats.openIssues} open issues`, tone: stats.openIssues > 0 ? "warn" : "ok" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My projects" value={stats.projects} suffix="active" />
        <StatCard label="Contributors" value={stats.contributors} suffix="assigned" />
        <StatCard
          label="Open issues"
          value={stats.openIssues}
          suffix={stats.openIssues === 1 ? "ticket" : "tickets"}
        />
        <StatCard label="Avg quality" value={stats.avgScore || "0.0"} suffix="/100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3">
            My contributors
          </div>
          <EmptyState
            title="No contributors yet"
            subtitle="Assigned contributors will appear here."
            icon={<Users className="h-8 w-8" />}
          />
        </Card>
        <Card>
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3">
            Daily dose
          </div>
          <p className="text-sm italic text-foreground/80 leading-relaxed">"{dose}"</p>
        </Card>
      </div>
    </>
  );
}

/* ---------------- ADMIN ---------------- */
function AdminDash({ dose }: { dose: string }) {
  const [stats, setStats] = useState({
    projects: 0,
    projTotal: 0,
    members: 0,
    openIssues: 0,
    pending: 0,
    onboardingPct: 0,
    avgScore: 0,
  });
  const [roles, setRoles] = useState<Record<string, number>>({});
  const [projects, setProjects] = useState<
    { name: string; sme: string; score: number | null; status: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const [
        activeProj,
        totalProj,
        members,
        issues,
        pending,
        allRoles,
        prog,
        scores,
        projs,
        profs,
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("quality_issues")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "pending"),
        supabase.from("user_roles").select("role,status"),
        supabase.from("contributor_progress").select("status"),
        supabase.from("quality_scores").select("score"),
        supabase.from("projects").select("id,name,sme_owner_id,status").limit(8),
        supabase.from("profiles").select("id,name,email"),
      ]);

      const total = prog.data?.length ?? 0;
      const done = prog.data?.filter((p) => p.status === "complete").length ?? 0;
      const onb = total ? Math.round((done / total) * 100) : 0;
      const avg = scores.data?.length
        ? Math.round(
            (scores.data.reduce((a, b) => a + Number(b.score), 0) / scores.data.length) * 10,
          ) / 10
        : 0;

      const profMap = new Map((profs.data ?? []).map((p: any) => [p.id, p.name ?? p.email]));
      setProjects(
        (projs.data ?? []).map((p: any) => ({
          name: p.name,
          sme: profMap.get(p.sme_owner_id) ?? "Unassigned",
          score: null,
          status: p.status,
        })),
      );

      const roleCounts: Record<string, number> = {
        super_admin: 0,
        tnq_team: 0,
        viewer: 0,
        contributor: 0,
        pending: 0,
      };
      (allRoles.data ?? []).forEach((r: any) => {
        const k = r.status === "pending" ? "pending" : r.role;
        roleCounts[k] = (roleCounts[k] ?? 0) + 1;
      });
      setRoles(roleCounts);

      setStats({
        projects: activeProj.count ?? 0,
        projTotal: totalProj.count ?? 0,
        members: members.count ?? 0,
        openIssues: issues.count ?? 0,
        pending: pending.count ?? 0,
        onboardingPct: onb,
        avgScore: avg,
      });
    })();
  }, []);

  return (
    <>
      <StatusPill
        items={[
          { label: "Backend connected", tone: "ok" },
          { label: `${stats.members} users online today`, tone: "ok" },
          { label: `${stats.openIssues} open issues`, tone: stats.openIssues > 0 ? "warn" : "ok" },
          { label: "Maintenance mode: off", tone: "ok" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active projects" value={stats.projects} suffix={`of ${stats.projTotal}`} />
        <StatCard label="Team members" value={stats.members} suffix="global" />
        <StatCard label="Onboarding %" value={stats.onboardingPct.toFixed(1)} />
        <StatCard label="Avg quality" value={stats.avgScore.toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-4">
            Team by role
          </div>
          <div className="space-y-2">
            {[
              { key: "super_admin", label: "SUPER ADMIN", cls: "bg-foreground text-background" },
              { key: "tnq_team", label: "TNQ TEAM", cls: "bg-orange-100 text-orange-800" },
              { key: "viewer", label: "VIEWER", cls: "bg-sky-100 text-sky-800" },
              { key: "contributor", label: "CONTRIBUTOR", cls: "bg-violet-100 text-violet-800" },
              { key: "pending", label: "PENDING", cls: "bg-amber-100 text-amber-800" },
            ].map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5"
              >
                <span
                  className={`font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded ${r.cls}`}
                >
                  {r.label}
                </span>
                <span className="font-digital text-xl text-foreground">{roles[r.key] ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-4">
            Project health matrix
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              subtitle="Create a project to see health metrics."
              icon={<FolderKanban className="h-8 w-8" />}
            />
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase pb-2 border-b border-border">
                <div>Project</div>
                <div>SME</div>
                <div>Score</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-border">
                {projects.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px] gap-2 py-2.5 text-sm">
                    <div className="font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-muted-foreground truncate">{p.sme}</div>
                    <div className="font-mono text-foreground">{p.score ?? "—"}</div>
                    <div>
                      <span
                        className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "paused"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
              Wall of excellence
            </div>
          </div>
          <EmptyState
            title="No recognitions yet"
            subtitle="Celebrate teammates from the admin console."
            icon={<Trophy className="h-8 w-8" />}
          />
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
              Pending actions
            </div>
          </div>
          {stats.pending > 0 ? (
            <div className="text-sm">
              {stats.pending} user(s) awaiting approval.{" "}
              <Link to="/admin/users" className="text-primary hover:underline">
                Review →
              </Link>
            </div>
          ) : (
            <EmptyState
              title="All clear"
              subtitle="No pending approvals."
              icon={<ClipboardCheck className="h-8 w-8" />}
            />
          )}
        </Card>
        <Card>
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3">
            Daily dose
          </div>
          <p className="text-sm italic text-foreground/80 leading-relaxed">"{dose}"</p>
        </Card>
      </div>
    </>
  );
}
