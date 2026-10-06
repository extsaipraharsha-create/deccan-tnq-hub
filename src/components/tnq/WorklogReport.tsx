/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Card, StatCard, Badge, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import {
  FolderKanban,
  AlertTriangle,
  Trophy,
  Flame,
  Eye,
  Info,
  ListChecks,
  CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import type { EntryType } from "@/lib/tnq/worklog-completion";
import {
  computeWorklogMetrics,
  daysBetween,
  isOverdueNow,
  type Range,
} from "@/lib/tnq/worklog-metrics";

type Priority = "P0" | "P1" | "P2" | "P3";
interface Entry {
  id: string;
  project_id: string | null;
  entry_type: EntryType;
  completed_at: string | null;
  completed_at_estimated: boolean;
  created_at: string;
  deadline: string | null;
  priority: Priority;
}
interface DelayLog {
  id: string;
  entry_id: string;
  old_deadline: string;
  new_deadline: string;
  created_at: string;
}
interface Project {
  id: string;
  name: string;
  emoji_icon: string | null;
}
interface ReviewRow {
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_LABEL: Record<EntryType, string> = {
  working_on: "Working On",
  need_help: "Need Help",
  completed: "Completed",
  blocked: "Blocked",
  review_needed: "Review Needed",
  available_to_help: "Available to Help",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
};

// Local-time month key, not a slice of the UTC ISO string - an entry
// created at 11:30pm local time near a month boundary would otherwise get
// bucketed into the wrong month depending on the viewer's UTC offset. Same
// local-time convention as worklog.tsx's dayKey().
function monthKeyOf(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function currentMonthKey() {
  return monthKeyOf(new Date().toISOString());
}
function shiftMonthKey(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
function monthShortLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
}
type Period = { kind: "month"; key: string } | { kind: "all" };

function monthRange(key: string): Range {
  const [y, m] = key.split("-").map(Number);
  return { from: new Date(y, m - 1, 1), to: new Date(y, m, 1) };
}
function periodToRange(p: Period): Range {
  return p.kind === "all" ? { from: null, to: null } : monthRange(p.key);
}

// Original pre-Section-2 "Current streak" stat - a plain local-day key and
// a backward walk from today (or yesterday, if nothing posted yet today).
function dayKeyOf(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function computeStreak(entries: Entry[]): number {
  const days = new Set(entries.map((e) => dayKeyOf(e.created_at)));
  const cursor = new Date();
  if (!days.has(dayKeyOf(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKeyOf(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Every percentage metric guards against a tiny denominator the same way:
// below 5 data points, a percentage reads as more confident than it is.
const SMALL_N = 5;

function MetricRow({
  label,
  tooltip,
  value,
  sub,
  delta,
  guardCount,
}: {
  label: string;
  tooltip: string;
  value: string;
  sub?: string;
  delta?: { pts: number; goodDirection: "up" | "down" } | null;
  guardCount?: number;
}) {
  const notEnough = guardCount !== undefined && guardCount < SMALL_N;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {label}
        <span title={tooltip} className="inline-flex">
          <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-hidden />
        </span>
      </span>
      <span className="text-right">
        {notEnough ? (
          <span className="font-mono text-xs text-muted-foreground">
            {guardCount} · not enough data yet
          </span>
        ) : (
          <>
            <span className="font-mono font-semibold">{value}</span>
            {sub && <span className="ml-1 font-mono text-xs text-muted-foreground">{sub}</span>}
            {delta && delta.pts !== 0 && (
              <span
                className={`ml-1.5 font-mono text-xs font-semibold ${
                  delta.pts >= 0 === (delta.goodDirection === "up")
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {delta.pts >= 0 ? "▲" : "▼"}
                {Math.abs(Math.round(delta.pts))}
              </span>
            )}
          </>
        )}
      </span>
    </div>
  );
}

// Shared by /my-report (self) and the Team Roster's "View report" action
// (anyone else) — same computation, just parameterized by whose data to
// pull. All figures are aggregated from tables that already exist.
//
// Two tabs share one data fetch: "Summary" is the original report exactly
// as it looked before the period-picker/metrics expansion (kept as the
// default so nothing changes for someone who never opens the other tab);
// "Detailed trends" is that expansion, added alongside rather than in
// place of it.
//
// Scoping convention for the Detailed tab (documented since the spec
// doesn't fully disambiguate every metric): "Monthly completion rate" and
// "Delay rate" (and the workload/project/priority breakdowns) scope by the
// entry's `created_at` falling in the picker's period - of what you took
// on, how much is done or got delayed. "Completed (this period)", "On-time
// completion rate" and "Average time to complete" scope by `completed_at`
// instead - of what you finished in this period, how was it - so an old
// entry just now finished counts, and a recent entry not yet finished
// doesn't. "Overall completion rate" is always all-time (per spec);
// "Currently overdue" / "Open items now" are always the real current
// moment regardless of the picker (they're "right now" snapshots, not
// trend metrics); the monthly completion chart is always the last 6 real
// calendar months. Review metrics scope by the review request's own
// created_at instead of entry created_at, since a review can be given on
// someone else's entry.
export function WorklogReport({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [delays, setDelays] = useState<DelayLog[]>([]);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [recognitionCount, setRecognitionCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewsGiven, setReviewsGiven] = useState<ReviewRow[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>({ kind: "month", key: currentMonthKey() });
  const [reportTab, setReportTab] = useState<"summary" | "detailed">("summary");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [
        { data: e },
        { data: dl },
        { data: sc },
        { data: rc },
        { data: pj },
        { data: rg },
        { data: rr },
      ] = await Promise.all([
        supabase
          .from("work_log_entries")
          .select(
            "id,project_id,entry_type,completed_at,completed_at_estimated,created_at,deadline,priority",
          )
          .eq("user_id", userId),
        (supabase as any)
          .from("work_log_delay_log")
          .select("id,entry_id,old_deadline,new_deadline,created_at")
          .eq("user_id", userId),
        supabase.from("quality_scores").select("score").eq("contributor_id", userId),
        (supabase as any).from("recognition_recipients").select("id").eq("contributor_id", userId),
        supabase.from("projects").select("id,name,emoji_icon"),
        (supabase as any)
          .from("work_log_review_requests")
          .select("created_at,reviewed_at")
          .eq("reviewer_id", userId)
          .neq("status", "pending"),
        (supabase as any)
          .from("work_log_review_requests")
          .select("created_at,reviewed_at")
          .eq("requested_by", userId)
          .neq("status", "pending"),
      ]);
      if (cancelled) return;
      setEntries((e as Entry[]) ?? []);
      setDelays((dl as DelayLog[]) ?? []);
      const scores = (sc as { score: number }[]) ?? [];
      setAvgScore(
        scores.length ? scores.reduce((a, b) => a + Number(b.score), 0) / scores.length : null,
      );
      setRecognitionCount((rc as any[])?.length ?? 0);
      setProjects((pj as Project[]) ?? []);
      setReviewsGiven((rg as ReviewRow[]) ?? []);
      setReviewsReceived((rr as ReviewRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ---------- Summary tab (original report, unchanged) ----------
  const summary = useMemo(() => {
    const completedAllTime = entries.filter((e) => e.entry_type === "completed").length;
    const thisMonthKey = currentMonthKey();
    const completedThisMonth = entries.filter(
      (e) =>
        e.entry_type === "completed" &&
        e.completed_at &&
        monthKeyOf(e.completed_at) === thisMonthKey,
    ).length;
    const completionRate = entries.length
      ? Math.round((completedAllTime / entries.length) * 100)
      : 0;
    const streak = computeStreak(entries);

    const projectCounts = new Map<string, number>();
    for (const e of entries) {
      if (!e.project_id) continue;
      projectCounts.set(e.project_id, (projectCounts.get(e.project_id) ?? 0) + 1);
    }
    const rankedProjects = Array.from(projectCounts.entries())
      .map(([id, count]) => ({ project: projects.find((p) => p.id === id), count }))
      .filter((x) => x.project)
      .sort((a, b) => b.count - a.count) as { project: Project; count: number }[];

    const avgDelayHours = delays.length
      ? delays.reduce(
          (sum, d) =>
            sum + (new Date(d.new_deadline).getTime() - new Date(d.old_deadline).getTime()),
          0,
        ) /
        delays.length /
        (1000 * 60 * 60)
      : 0;
    const blockedCount = entries.filter((e) => e.entry_type === "blocked").length;
    const blockedPct = entries.length ? Math.round((blockedCount / entries.length) * 100) : 0;

    const avgReviewHours = (list: ReviewRow[]) => {
      const done = list.filter((r) => r.reviewed_at);
      if (done.length === 0) return null;
      const total = done.reduce(
        (sum, r) => sum + (new Date(r.reviewed_at!).getTime() - new Date(r.created_at).getTime()),
        0,
      );
      return total / done.length / (1000 * 60 * 60);
    };

    return {
      completedAllTime,
      completedThisMonth,
      completionRate,
      streak,
      rankedProjects,
      avgDelayHours,
      blockedCount,
      blockedPct,
      avgTimeToReviewOthers: avgReviewHours(reviewsGiven),
    };
  }, [entries, delays, projects, reviewsGiven]);

  // ---------- Detailed trends tab (Section 2 expansion) ----------
  const stats = useMemo(() => {
    // Two different scoping fields, deliberately: "completion rate" and
    // "delay rate" are about entries *created* in the period (of what you
    // took on, how much is done / got delayed); "on-time rate" and "average
    // time to complete" are about entries *completed* in the period (of what
    // you finished, how was it) - scoping those by created_at would mix in
    // old entries just now getting finished and exclude recent ones not
    // finished yet, which isn't what either metric is asking.
    const scopeReviews = (list: ReviewRow[], p: Period) =>
      p.kind === "all" ? list : list.filter((r) => monthKeyOf(r.created_at) === p.key);

    function computeFor(p: Period) {
      const metrics = computeWorklogMetrics(entries, delays, periodToRange(p));

      const scopedReviewsGiven = scopeReviews(reviewsGiven, p);
      const scopedReviewsReceived = scopeReviews(reviewsReceived, p);
      const reviewTurnaround = (list: ReviewRow[]) => {
        const done = list.filter((r) => r.reviewed_at);
        if (done.length === 0) return null;
        return (
          done.reduce((sum, r) => sum + daysBetween(r.created_at, r.reviewed_at!) * 24, 0) /
          done.length
        );
      };

      return {
        ...metrics,
        reviewsGivenCount: scopedReviewsGiven.length,
        reviewsReceivedCount: scopedReviewsReceived.length,
        avgReviewTurnaroundHoursGiven: reviewTurnaround(scopedReviewsGiven),
      };
    }

    const current = computeFor(period);
    const previous =
      period.kind === "month"
        ? computeFor({ kind: "month", key: shiftMonthKey(period.key, -1) })
        : null;

    // Fixed "right now" snapshots — independent of the picker.
    const thisMonthKey = currentMonthKey();
    const openEntries = entries.filter((e) => e.entry_type !== "completed");
    const currentlyOverdue = openEntries.filter(
      (e) => e.deadline && isOverdueNow(e.deadline),
    ).length;
    const openByStatus = new Map<EntryType, number>();
    for (const e of openEntries)
      openByStatus.set(e.entry_type, (openByStatus.get(e.entry_type) ?? 0) + 1);

    // Overall completion rate — always all-time, per spec.
    const overallCompleted = entries.filter((e) => e.entry_type === "completed").length;
    const overallTotal = entries.length;

    // Last 6 real calendar months, for the monthly-completion-rate chart —
    // independent of the picker.
    const last6 = Array.from({ length: 6 }, (_, i) => shiftMonthKey(thisMonthKey, i - 5)).map(
      (key) => {
        const monthEntries = entries.filter((e) => monthKeyOf(e.created_at) === key);
        const monthCompleted = monthEntries.filter((e) => e.entry_type === "completed");
        return {
          key,
          label: monthShortLabel(key),
          total: monthEntries.length,
          rate: monthEntries.length
            ? Math.round((monthCompleted.length / monthEntries.length) * 100)
            : 0,
        };
      },
    );

    const topProjectId = Array.from(current.projectCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    return {
      current,
      previous,
      currentlyOverdue,
      openByStatus,
      overallCompleted,
      overallTotal,
      last6,
      topProjectId,
    };
  }, [entries, delays, reviewsGiven, reviewsReceived, period]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const {
    current,
    previous,
    currentlyOverdue,
    openByStatus,
    overallCompleted,
    overallTotal,
    last6,
    topProjectId,
  } = stats;
  const topProject = projects.find((p) => p.id === topProjectId);
  const overallRatePct = overallTotal ? Math.round((overallCompleted / overallTotal) * 100) : 0;
  const onTimePct =
    current.onTimeDenominator >= SMALL_N
      ? Math.round((current.onTimeNumerator / current.onTimeDenominator) * 100)
      : null;
  // The summary line's "completed" count and "on time" clause must describe
  // the same set of entries (completed_at-scoped), or the sentence reads
  // inconsistently with itself - this uses completedInPeriodCount, not the
  // created_at-scoped completedCount the "Monthly completion rate" row uses.
  const completedDelta = previous
    ? current.completedInPeriodCount - previous.completedInPeriodCount
    : null;
  const periodLabel = period.kind === "all" ? "All time" : monthLabel(period.key);
  const previousMonthLabel =
    period.kind === "month" ? monthLabel(shiftMonthKey(period.key, -1)) : null;
  const completedLabel =
    period.kind === "all"
      ? "Completed (all time)"
      : period.key === currentMonthKey()
        ? "Completed this month"
        : `Completed in ${monthShortLabel(period.key)}`;
  const onTimeClause =
    current.onTimeDenominator === 0
      ? null
      : current.onTimeDenominator < SMALL_N
        ? `${current.onTimeNumerator} of ${current.onTimeDenominator} on time`
        : `${onTimePct}% on time`;

  const summaryParts = [
    `${periodLabel}: ${current.completedInPeriodCount} task${current.completedInPeriodCount === 1 ? "" : "s"} completed`,
    completedDelta !== null && completedDelta !== 0 && previousMonthLabel
      ? `(${completedDelta > 0 ? "▲" : "▼"}${Math.abs(completedDelta)} vs ${previousMonthLabel})`
      : null,
    onTimeClause,
    topProject ? `most work on ${topProject.name}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Tab toggle - "Summary" (the original report, unchanged) is the
          default; "Detailed trends" is the period-picker/metrics expansion,
          added as a second tab rather than replacing the original. */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit">
        {(
          [
            { key: "summary" as const, label: "Summary" },
            { key: "detailed" as const, label: "Detailed trends" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setReportTab(t.key)}
            className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.14em] px-3 py-1.5 rounded-full transition-colors uppercase ${
              reportTab === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {reportTab === "summary" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Completed" value={summary.completedAllTime} suffix="all-time" />
            <StatCard label="Completed" value={summary.completedThisMonth} suffix="this month" />
            <StatCard label="Completion rate" value={summary.completionRate} suffix="%" />
            <StatCard
              label="Current streak"
              value={summary.streak}
              suffix={summary.streak === 1 ? "day" : "days"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Reviews
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviews given</span>
                  <span className="font-mono font-semibold">{reviewsGiven.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviews received</span>
                  <span className="font-mono font-semibold">{reviewsReceived.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. time to review</span>
                  <span className="font-mono font-semibold">
                    {summary.avgTimeToReviewOthers !== null
                      ? `${summary.avgTimeToReviewOthers.toFixed(1)}h`
                      : "—"}
                  </span>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <FolderKanban className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Project contribution
                </div>
              </div>
              {summary.rankedProjects.length === 0 ? (
                <EmptyState title="No projects yet" icon={<FolderKanban className="h-8 w-8" />} />
              ) : (
                <div className="space-y-2">
                  {summary.rankedProjects.map((r, i) => (
                    <div
                      key={r.project.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {r.project.emoji_icon ?? "📁"} {r.project.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {i === 0 && <Badge tone="success">Most active</Badge>}
                        <span className="font-mono text-xs text-muted-foreground">{r.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Delays &amp; blockers
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deadline reschedules</span>
                  <span className="font-mono font-semibold">{delays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. delay length</span>
                  <span className="font-mono font-semibold">
                    {delays.length ? `${summary.avgDelayHours.toFixed(1)}h` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Blocked entries</span>
                  <span className="font-mono font-semibold">
                    {summary.blockedCount} ({summary.blockedPct}%)
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Quality &amp; recognition
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average quality score</span>
                  <span className="font-mono font-semibold">
                    {avgScore !== null ? avgScore.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wall of Excellence mentions</span>
                  <span className="font-mono font-semibold flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-primary" /> {recognitionCount}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Period control */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground font-medium">{summaryParts.join(", ")}.</p>
            <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft shrink-0">
              <button
                onClick={() =>
                  setPeriod((p) => ({
                    kind: "month",
                    key: p.kind === "month" ? p.key : currentMonthKey(),
                  }))
                }
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.14em] px-3 py-1.5 rounded-full transition-colors uppercase ${
                  period.kind === "month"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Month
              </button>
              {period.kind === "month" && (
                <input
                  type="month"
                  value={period.key}
                  onChange={(e) => setPeriod({ kind: "month", key: e.target.value })}
                  className="h-7 rounded-full border border-border bg-card px-2 text-xs text-foreground"
                />
              )}
              <button
                onClick={() => setPeriod({ kind: "all" })}
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.14em] px-3 py-1.5 rounded-full transition-colors uppercase ${
                  period.kind === "all"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All time
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Completion rate (to date)"
              value={overallRatePct}
              suffix={`${overallCompleted} of ${overallTotal}`}
            />
            <StatCard label={completedLabel} value={current.completedInPeriodCount} />
            <StatCard label="Currently overdue" value={currentlyOverdue} />
            <StatCard
              label={`Avg. time to complete${period.kind === "month" ? ` (${monthShortLabel(period.key)})` : ""}`}
              value={
                current.avgDaysToComplete !== null ? current.avgDaysToComplete.toFixed(1) : "—"
              }
              suffix={current.avgDaysToComplete !== null ? "days" : undefined}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Completion
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <MetricRow
                  label="On-time completion rate"
                  tooltip="Of entries completed in this period that had a deadline, how many were completed on or before it."
                  value={onTimePct !== null ? `${onTimePct}%` : "—"}
                  sub={`(${current.onTimeNumerator} of ${current.onTimeDenominator})`}
                  guardCount={current.onTimeDenominator}
                />
                <MetricRow
                  label="Monthly completion rate"
                  tooltip="Of entries created in this period, the share that are now completed."
                  value={`${Math.round(current.monthlyCompletionRate * 100)}%`}
                  sub={`(${current.completedCount} of ${current.scopedCount})`}
                  guardCount={current.scopedCount}
                />
              </div>
              <div className="mt-4 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last6} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      axisLine={{ stroke: "var(--color-border)" }}
                      tickLine={false}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <RTooltip
                      formatter={(v: number) => [`${v}%`, "Completion rate"]}
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Last 6 months</p>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Delays
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <MetricRow
                  label="Delay rate"
                  tooltip="Of entries in this period that had a deadline, how many were rescheduled at least once."
                  value={
                    current.delayRateDenominator
                      ? `${Math.round((current.delayRateNumerator / current.delayRateDenominator) * 100)}%`
                      : "—"
                  }
                  sub={`(${current.delayRateNumerator} of ${current.delayRateDenominator})`}
                  guardCount={current.delayRateDenominator}
                />
                <MetricRow
                  label="Avg. delay length"
                  tooltip="Average number of days a deadline was pushed out, across all reschedules in this period."
                  value={
                    current.avgDelayDays !== null ? `${current.avgDelayDays.toFixed(1)} days` : "—"
                  }
                />
                <MetricRow
                  label="Total reschedules"
                  tooltip="How many times a deadline was pushed out in this period."
                  value={String(current.totalReschedules)}
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Workload &amp; focus
                </div>
              </div>
              <div className="space-y-3 text-sm mb-3">
                {(
                  [
                    "blocked",
                    "need_help",
                    "working_on",
                    "review_needed",
                    "available_to_help",
                  ] as EntryType[]
                ).map(
                  (t) =>
                    (openByStatus.get(t) ?? 0) > 0 && (
                      <div key={t} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{STATUS_LABEL[t]}</span>
                        <span className="font-mono font-semibold">{openByStatus.get(t)}</span>
                      </div>
                    ),
                )}
                {openByStatus.size === 0 && (
                  <div className="text-xs text-muted-foreground">No open items.</div>
                )}
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Priority mix
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => {
                    const count = current.priorityCounts[p];
                    const pct = current.scopedCount ? (count / current.scopedCount) * 100 : 0;
                    if (pct === 0) return null;
                    const color = { P0: "#e11d48", P1: "#f59e0b", P2: "#64748b", P3: "#38bdf8" }[p];
                    return (
                      <div
                        key={p}
                        style={{ width: `${pct}%`, background: color }}
                        title={`${PRIORITY_LABEL[p]}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <FolderKanban className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Project mix
                </div>
              </div>
              {current.projectCounts.size === 0 ? (
                <EmptyState title="No projects yet" icon={<FolderKanban className="h-8 w-8" />} />
              ) : (
                <div className="space-y-2">
                  {Array.from(current.projectCounts.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([pid, count], i) => {
                      const proj = projects.find((p) => p.id === pid);
                      if (!proj) return null;
                      return (
                        <div
                          key={pid}
                          className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
                        >
                          <span className="min-w-0 truncate text-sm text-foreground">
                            {proj.emoji_icon ?? "📁"} {proj.name}
                          </span>
                          <div className="flex shrink-0 items-center gap-2">
                            {i === 0 && <Badge tone="success">Most active</Badge>}
                            <span className="font-mono text-xs text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Reviews
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <MetricRow
                  label="Reviews given"
                  tooltip="Review requests from others that this person responded to in this period."
                  value={String(current.reviewsGivenCount)}
                />
                <MetricRow
                  label="Reviews received"
                  tooltip="This person's own review requests that got a response in this period."
                  value={String(current.reviewsReceivedCount)}
                />
                <MetricRow
                  label="Avg. time to review"
                  tooltip="Average time between a review being requested and this person responding to it."
                  value={
                    current.avgReviewTurnaroundHoursGiven !== null
                      ? `${current.avgReviewTurnaroundHoursGiven.toFixed(1)}h`
                      : "—"
                  }
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                  Quality &amp; recognition
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average quality score</span>
                  <span className="font-mono font-semibold">
                    {avgScore !== null ? avgScore.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wall of Excellence mentions</span>
                  <span className="font-mono font-semibold flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-primary" /> {recognitionCount}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
