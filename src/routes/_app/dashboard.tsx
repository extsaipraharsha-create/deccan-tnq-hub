/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FlaskConical,
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
import { Card, StatCard, EmptyState, StatusPill, Badge, Button, Modal } from "@/components/tnq/ui";
import { pickDailyDose, greeting, ROLE_LABEL } from "@/lib/tnq/constants";
import { isTeamRole } from "@/lib/tnq/types";
import {
  computeWorklogMetrics,
  countOpen,
  countReschedulesInRange,
  localWeekRange,
  type MetricsEntry,
  type MetricsDelayLog,
} from "@/lib/tnq/worklog-metrics";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { role, profile } = useAuth();
  const dose = useMemo(() => pickDailyDose(profile?.id), [profile?.id]);
  const firstName = (profile?.name ?? profile?.email ?? "there").split(/[ @]/)[0];
  // Assume expanded (today's two-column look) until the Wall reports
  // otherwise, so there's no flash from full-width to narrow on first load.
  const [wallExpanded, setWallExpanded] = useState(true);

  const heroTitle =
    role === "super_admin"
      ? "Platform control center."
      : isTeamRole(role)
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

      <WeeklyDigestCard />

      {/* Scannable stats stay full-width up top. Below that, when the Wall
          has content it gets a side rail next to the main column; when it's
          hidden (nothing recent), that rail collapses and everything -
          including "My open items" - reflows to the full width instead of
          leaving an empty, left-sided-looking column. */}
      <div
        className={`grid grid-cols-1 gap-6 items-start ${wallExpanded ? "lg:grid-cols-[1fr_340px]" : ""}`}
      >
        <div className="space-y-8 min-w-0">
          <NeedsReviewWidget />
          {role === "contributor" && <ContributorDash dose={dose} />}
          {isTeamRole(role) && <SmeDash dose={dose} />}
          {role === "super_admin" && <AdminDash dose={dose} />}
        </div>
        <div
          className={
            wallExpanded
              ? "space-y-4 lg:sticky lg:top-6"
              : "flex flex-col sm:flex-row sm:items-center gap-4"
          }
        >
          <a
            href="/worklog?view=board&mine=1"
            className={`block bg-card border border-border rounded-2xl p-4 shadow-soft hover:shadow-lift transition-shadow ${wallExpanded ? "" : "sm:flex-1"}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <LayoutGrid className="h-4 w-4 text-primary" /> My open items
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Jump into your Worklog board, filtered to just yours →
            </div>
          </a>
          <WallOfExcellence onExpandedChange={setWallExpanded} />
        </div>
      </div>
    </div>
  );
}

/* ------------ WEEKLY DIGEST (Fri-Mon, worklog posters only) ------------ */
// Computed with the exact same functions WorklogReport uses
// (computeWorklogMetrics), just handed a week-long range instead of a
// month - so "completed" here always agrees with what the report would
// show for the same window. Shows Friday through Monday (viewer's local
// time), dismissible per calendar week.
function WeeklyDigestCard() {
  const { user, role } = useAuth();
  const [entries, setEntries] = useState<MetricsEntry[]>([]);
  const [delays, setDelays] = useState<MetricsDelayLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const day = new Date().getDay(); // 0 Sun .. 6 Sat
  const isFriThroughMon = day === 5 || day === 6 || day === 0 || day === 1;
  const canShow = (role === "super_admin" || isTeamRole(role)) && isFriThroughMon;
  const weekRange = useMemo(() => localWeekRange(new Date()), []);
  const weekStartKey = weekRange.from
    ? `${weekRange.from.getFullYear()}-${String(weekRange.from.getMonth() + 1).padStart(2, "0")}-${String(weekRange.from.getDate()).padStart(2, "0")}`
    : "";
  const dismissKey = user ? `tnq_digest_dismissed_${user.id}` : null;

  useEffect(() => {
    if (!dismissKey) return;
    try {
      if (localStorage.getItem(dismissKey) === weekStartKey) setDismissed(true);
    } catch {
      // Not persisted - card just shows again next visit this week.
    }
  }, [dismissKey, weekStartKey]);

  useEffect(() => {
    if (!user || !canShow) return;
    (async () => {
      const [{ data: e }, { data: dl }] = await Promise.all([
        supabase
          .from("work_log_entries")
          .select(
            "id,project_id,entry_type,completed_at,completed_at_estimated,created_at,deadline,priority",
          )
          .eq("user_id", user.id),
        (supabase as any)
          .from("work_log_delay_log")
          .select("id,entry_id,old_deadline,new_deadline,created_at")
          .eq("user_id", user.id),
      ]);
      setEntries((e as MetricsEntry[]) ?? []);
      setDelays((dl as MetricsDelayLog[]) ?? []);
      setLoaded(true);
    })();
  }, [user?.id, canShow]);

  function dismiss() {
    setDismissed(true);
    if (!dismissKey) return;
    try {
      localStorage.setItem(dismissKey, weekStartKey);
    } catch {
      // Not persisted this session - harmless, just reappears next visit.
    }
  }

  if (!canShow || dismissed || !loaded) return null;

  const metrics = computeWorklogMetrics(entries, delays, weekRange);
  const slipped = countReschedulesInRange(delays, weekRange);
  const open = countOpen(entries);

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
          Your week so far
        </div>
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Completed" value={metrics.completedInPeriodCount} />
        <StatCard label="Slipped" value={slipped} />
        <StatCard label="Open into next week" value={open} />
      </div>
    </Card>
  );
}

/* ------------ WALL OF EXCELLENCE (all roles) ------------ */
type Post = { id: string; given_by: string; message: string; created_at: string };
type Recipient = { id: string; post_id: string; contributor_id: string };
// Posts older than this fall off the Wall - the design/interaction
// (collapse, give-recognition link, reactions, confetti) is unchanged;
// only which posts are shown changes.
const RECOGNITION_WINDOW_MS = 48 * 60 * 60 * 1000;

function WallOfExcellence({
  onExpandedChange,
}: {
  /** Reports whether the Wall is showing its full card (true) or has
   * collapsed to a bare link (false), so the Dashboard can reflow its
   * layout instead of leaving an empty side rail. */
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const { role, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [profiles, setProfiles] = useState<
    { id: string; name: string | null; email: string | null }[]
  >([]);
  const [celebrate, setCelebrate] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPosts, setHistoryPosts] = useState<Post[] | null>(null);
  const canGive = role === "super_admin" || isTeamRole(role);
  const seenIds = useRef<Set<string> | null>(null);

  const load = async () => {
    const windowStartIso = new Date(Date.now() - RECOGNITION_WINDOW_MS).toISOString();
    const [{ data: p }, { data: r }, { data: rx }, { data: pf }] = await Promise.all([
      (supabase as any)
        .from("recognition_posts")
        .select("*")
        .gte("created_at", windowStartIso)
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
    setLoaded(true);
  };
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  // "See past recognitions" - fetched on demand (not part of the regular
  // poll) since it's the one place that needs the full, unwindowed history.
  async function openHistory() {
    setHistoryOpen(true);
    if (historyPosts !== null) return;
    const { data } = await (supabase as any)
      .from("recognition_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setHistoryPosts((data as Post[]) ?? []);
  }

  // Auto-hide: the server-side window above already re-excludes aged-out
  // posts on every poll/refetch, but a post can cross the 48h line between
  // polls - this client-side tick re-filters the already-fetched list every
  // 30s so it still disappears without waiting on the next network refresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const visiblePosts = useMemo(
    () => posts.filter((p) => now - new Date(p.created_at).getTime() < RECOGNITION_WINDOW_MS),
    [posts, now],
  );
  useEffect(() => {
    if (!loaded) return;
    onExpandedChange?.(visiblePosts.length > 0);
  }, [loaded, visiblePosts.length, onExpandedChange]);

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

  const historyModal = (
    <Modal
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}
      title="Past recognitions"
      size="lg"
    >
      {historyPosts === null ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : historyPosts.length === 0 ? (
        <EmptyState title="No recognitions yet" icon={<Trophy className="h-8 w-8" />} />
      ) : (
        <div className="space-y-3">
          {historyPosts.map((p) => (
            <div key={p.id} className="rounded-lg bg-muted/40 px-3 py-2.5">
              <div className="text-sm font-medium text-foreground">
                {recipientsFor(p.id).map(who).join(", ") || "—"}
              </div>
              <div className="text-sm text-foreground/90 whitespace-pre-wrap">{p.message}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                by {who(p.given_by)} ·{" "}
                {new Date(p.created_at).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
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
    </Modal>
  );

  // Closes entirely once loaded and nothing's in the 48h window - not just
  // an empty message - and reappears on its own the moment a new one lands
  // (visiblePosts is reactive to the poll/realtime subscription above). A
  // bare link (no card/header) stays behind so older recognitions are
  // still reachable while the Wall itself is closed.
  if (loaded && visiblePosts.length === 0) {
    return (
      <>
        <button
          onClick={openHistory}
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          See past recognitions
        </button>
        {historyModal}
      </>
    );
  }

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
          {visiblePosts.length > 0 && <Badge tone="default">{visiblePosts.length}</Badge>}
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
            <div className="mb-3 flex items-center justify-between">
              {canGive ? (
                <Link
                  to="/admin/recognitions"
                  className="font-mono text-[11px] tracking-wider text-primary uppercase hover:underline"
                >
                  Give recognition →
                </Link>
              ) : (
                <span />
              )}
              <button
                onClick={openHistory}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                See past recognitions
              </button>
            </div>
            {visiblePosts.length === 0 ? (
              <EmptyState
                title="No recognitions in the last 48 hours"
                subtitle={
                  canGive ? "Give one above." : "Celebrate teammates from the admin console."
                }
                icon={<Trophy className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-3">
                {visiblePosts.map((p) => (
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

      {historyModal}
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Modules done" value={stats.done} suffix={`of ${stats.total}`} />
        <StatCard label="Active projects" value={stats.activeProjectCount} suffix="active" />
        <StatCard label="Last score" value={stats.lastScore || "0.0"} suffix="/100" />
        <StatCard label="Projects" value={stats.projectCount} suffix="assigned" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My projects" value={stats.projects} suffix="active" />
        <StatCard label="Active Contributors" value={stats.activeContributors} />
        <StatCard label="Open Issues This Week" value={stats.openIssuesThisWeek} />
        <StatCard label="Contributors" value={stats.contributors} suffix="assigned" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
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
  const load = async () => {
    const [activeProj, totalProj, members, issues, pending, prog, scores] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "active"),
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
      supabase.from("contributor_progress").select("status"),
      supabase.from("quality_scores").select("score"),
    ]);

    const total = prog.data?.length ?? 0;
    const done = prog.data?.filter((p) => p.status === "complete").length ?? 0;
    const onb = total ? Math.round((done / total) * 100) : 0;
    const avg = scores.data?.length
      ? Math.round(
          (scores.data.reduce((a, b) => a + Number(b.score), 0) / scores.data.length) * 10,
        ) / 10
      : 0;

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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active projects" value={stats.projects} suffix={`of ${stats.projTotal}`} />
        <StatCard label="Team members" value={stats.members} suffix="global" />
        <StatCard label="Open issues" value={stats.openIssues} />
        <StatCard label="Pending users" value={stats.pending} />
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
