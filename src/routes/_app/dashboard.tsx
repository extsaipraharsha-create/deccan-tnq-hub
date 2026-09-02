/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FlaskConical,
  FolderKanban,
  Award,
  Users,
  ClipboardCheck,
  Activity,
  Trophy,
  AlertCircle,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { supabase } from "@/integrations/supabase/client";
import { Confetti } from "@/components/tnq/Confetti";
import { ReactionBar, type Reaction } from "@/components/tnq/ReactionBar";
import { NeedsReviewWidget } from "@/components/tnq/NeedsReviewWidget";
import { Card, StatCard, EmptyState, StatusPill, Badge } from "@/components/tnq/ui";
import { pickDailyDose, greeting, ROLE_LABEL } from "@/lib/tnq/constants";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { role, profile } = useAuth();
  const dose = useMemo(() => pickDailyDose(profile?.id), [profile?.id]);
  const firstName = (profile?.name ?? profile?.email ?? "there").split(/[ @]/)[0];

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

      {/* Scannable stats stay full-width up top; everything else splits into
          a main column plus a side rail instead of one long vertical stack. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-8 min-w-0">
          <NeedsReviewWidget />
          {role === "contributor" && <ContributorDash dose={dose} />}
          {role === "tnq_team" && <SmeDash dose={dose} />}
          {role === "super_admin" && <AdminDash dose={dose} />}
          <QualityByProject role={role} />
        </div>
        <div className="space-y-4 lg:sticky lg:top-6">
          <a
            href="/worklog?view=board&mine=1"
            className="block bg-card border border-border rounded-2xl p-4 shadow-soft hover:shadow-lift transition-shadow"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <LayoutGrid className="h-4 w-4 text-primary" /> My open items
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Jump into your Worklog board, filtered to just yours →
            </div>
          </a>
          <WallOfExcellence />
        </div>
      </div>
    </div>
  );
}

/* ------------ WALL OF EXCELLENCE (all roles) ------------ */
type Post = { id: string; given_by: string; message: string; created_at: string };
type Recipient = { id: string; post_id: string; contributor_id: string };
function WallOfExcellence() {
  const { role, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [profiles, setProfiles] = useState<
    { id: string; name: string | null; email: string | null }[]
  >([]);
  const [celebrate, setCelebrate] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const canGive = role === "super_admin" || role === "tnq_team";
  const seenIds = useRef<Set<string> | null>(null);

  const load = async () => {
    const [{ data: p }, { data: r }, { data: rx }, { data: pf }] = await Promise.all([
      (supabase as any)
        .from("recognition_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      (supabase as any).from("recognition_recipients").select("*"),
      (supabase as any).from("recognition_reactions").select("*"),
      supabase.from("profiles").select("id,name,email"),
    ]);
    const nextPosts = (p as Post[]) ?? [];
    // Fire confetti when a post neither the poster nor anyone else has
    // "seen" on this screen yet shows up — i.e. for viewers watching the
    // wall live, not for the person who just clicked Post themselves.
    if (seenIds.current) {
      const isNew = nextPosts.some((post) => !seenIds.current!.has(post.id));
      if (isNew) setCelebrate((c) => c + 1);
    }
    seenIds.current = new Set(nextPosts.map((post) => post.id));
    setPosts(nextPosts);
    setRecipients((r as Recipient[]) ?? []);
    setReactions((rx as Reaction[]) ?? []);
    setProfiles((pf as any) ?? []);
  };
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  useEffect(() => {
    const ch = supabase
      .channel("dashboard-recognitions")
      .on("postgres_changes", { event: "*", schema: "public", table: "recognition_posts" }, () =>
        load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recognition_reactions" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const who = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p?.name ?? p?.email ?? "—";
  };
  const recipientsFor = (postId: string) =>
    recipients.filter((r) => r.post_id === postId).map((r) => r.contributor_id);
  const reactionsFor = (postId: string) => reactions.filter((r) => r.post_id === postId);

  return (
    <Card>
      <Confetti fire={celebrate} />
      <button
        onClick={() => setCollapsed((s) => !s)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
            Wall of excellence
          </div>
          {posts.length > 0 && <Badge tone="default">{posts.length}</Badge>}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${collapsed ? "" : "rotate-180"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {canGive && (
              <div className="mb-3">
                <Link
                  to="/admin/recognitions"
                  className="font-mono text-[11px] tracking-wider text-primary uppercase hover:underline"
                >
                  Give recognition →
                </Link>
              </div>
            )}
            {posts.length === 0 ? (
              <EmptyState
                title="No recognitions yet"
                subtitle={
                  canGive
                    ? "Give the first one above."
                    : "Celebrate teammates from the admin console."
                }
                icon={<Trophy className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-3">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-lg bg-muted/40 px-3 py-2.5">
                    <div className="text-sm font-medium text-foreground">
                      {recipientsFor(p.id).map(who).join(", ") || "—"}
                    </div>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {p.message}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      by {who(p.given_by)}
                    </div>
                    <ReactionBar
                      postId={p.id}
                      reactions={reactionsFor(p.id)}
                      userId={user?.id}
                      onChange={load}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
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

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [user?.id]);
  useAutoRefresh(load);

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
  const [stats, setStats] = useState({
    done: 0,
    total: 0,
    lastScore: 0,
    projectCount: 0,
    activeProjectCount: 0,
  });

  const load = async () => {
    if (!user) return;
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
    const projectIds: string[] = contrib?.projects ?? [];
    let activeProjectCount = 0;
    if (projectIds.length > 0) {
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .in("id", projectIds)
        .eq("status", "active");
      activeProjectCount = count ?? 0;
    }
    setStats({
      done: prog?.filter((p) => p.status === "complete").length ?? 0,
      total: prog?.length ?? 0,
      lastScore: scores?.[0]?.score ?? 0,
      projectCount: projectIds.length,
      activeProjectCount,
    });
  };

  useEffect(() => {
    load();
  }, [user]);
  useAutoRefresh(load);

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
        <StatCard label="Active projects" value={stats.activeProjectCount} suffix="active" />
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
  const [stats, setStats] = useState<{
    projects: number;
    contributors: number;
    activeContributors: number;
    openIssuesThisWeek: number;
  }>({
    projects: 0,
    contributors: 0,
    activeContributors: 0,
    openIssuesThisWeek: 0,
  });

  const load = async () => {
    if (!user) return;
    const [{ count: projCount }, { data: contribs }] = await Promise.all([
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("sme_owner_id", user.id),
      supabase.from("contributors").select("id").eq("sme_id", user.id),
    ]);
    const ids = (contribs ?? []).map((c) => c.id);
    // (Removed Avg quality / Onboarding % stat cards per request)
    // Remaining SME stats are computed below for:
    // - Active Contributors
    // - Open Issues This Week
    void ids;
    // Active Contributors + Open Issues This Week stats
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { count: activeCount } = await supabase
      .from("contributors")
      .select("id", { count: "exact", head: true })
      .neq("onboarding_status", "not_started");

    const { count: openWeekCount } = await supabase
      .from("quality_issues")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .gte("created_at", sevenDaysAgoISO);

    setStats({
      projects: projCount ?? 0,
      contributors: ids.length,
      activeContributors: activeCount ?? 0,
      openIssuesThisWeek: openWeekCount ?? 0,
    });
  };

  useEffect(() => {
    load();
  }, [user]);
  useAutoRefresh(load);

  return (
    <>
      <StatusPill
        items={[
          { label: "Backend connected", tone: "ok" },
          { label: `${stats.contributors} contributors`, tone: "ok" },
          {
            label: `${stats.openIssuesThisWeek} open issues (7d)`,
            tone: stats.openIssuesThisWeek > 0 ? "warn" : "ok",
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My projects" value={stats.projects} suffix="active" />
        <StatCard label="Active Contributors" value={stats.activeContributors} />
        <StatCard label="Open Issues This Week" value={stats.openIssuesThisWeek} />
        <StatCard label="Contributors" value={stats.contributors} suffix="assigned" />
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

  const load = async () => {
    const [activeProj, totalProj, members, issues, pending, allRoles, prog, scores, projs, profs] =
      await Promise.all([
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
  };

  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

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
        <StatCard label="Open issues" value={stats.openIssues} />
        <StatCard label="Pending users" value={stats.pending} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
