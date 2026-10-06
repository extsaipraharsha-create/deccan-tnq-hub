import type { EntryType } from "@/lib/tnq/worklog-completion";

export type Priority = "P0" | "P1" | "P2" | "P3";

export interface MetricsEntry {
  id: string;
  project_id: string | null;
  entry_type: EntryType;
  completed_at: string | null;
  completed_at_estimated: boolean;
  created_at: string;
  deadline: string | null;
  priority: Priority;
}

export interface MetricsDelayLog {
  id: string;
  entry_id: string;
  old_deadline: string;
  new_deadline: string;
  created_at: string;
}

// An instant range, [from, to) - either side null means unbounded. This is
// what WorklogReport's month/all-time period picker reduces to before
// calling computeWorklogMetrics(), and what the weekly digest builds
// directly for "this week" - one range shape, one set of formulas, so a
// metric means the same thing wherever it's shown.
export type Range = { from: Date | null; to: Date | null };

export function daysBetween(aIso: string, bIso: string) {
  return (new Date(bIso).getTime() - new Date(aIso).getTime()) / (1000 * 60 * 60 * 24);
}

export function isOverdueNow(deadline: string) {
  return new Date(deadline).getTime() < Date.now();
}

function inRange(iso: string, range: Range) {
  const t = new Date(iso).getTime();
  if (range.from && t < range.from.getTime()) return false;
  if (range.to && t >= range.to.getTime()) return false;
  return true;
}

// The exact aggregation WorklogReport shows per month/all-time, generalized
// to any [from, to) range - so the weekly digest can ask "this week" and
// get numbers that agree with what the report would show for that window,
// instead of a second, possibly-drifting implementation.
//
// Scoping convention (unchanged from WorklogReport): "completion rate" and
// "delay rate" scope by the entry's created_at falling in range (what was
// taken on); "completed count", "on-time rate" and "average time to
// complete" scope by completed_at instead (what got finished), excluding
// completed_at_estimated rows from the duration average.
export function computeWorklogMetrics(
  entries: MetricsEntry[],
  delays: MetricsDelayLog[],
  range: Range,
) {
  const scoped = entries.filter((e) => inRange(e.created_at, range));
  const ids = new Set(scoped.map((e) => e.id));
  const scopedDelays = delays.filter((d) => ids.has(d.entry_id));

  const completed = scoped.filter((e) => e.entry_type === "completed");
  const completionRate = scoped.length ? completed.length / scoped.length : 0;

  const completedInRange = entries.filter(
    (e) => e.entry_type === "completed" && e.completed_at && inRange(e.completed_at, range),
  );
  const completedWithDeadline = completedInRange.filter((e) => e.deadline);
  const onTime = completedWithDeadline.filter(
    (e) => new Date(e.completed_at!).getTime() <= new Date(e.deadline!).getTime(),
  );
  const completedForDuration = completedInRange.filter((e) => !e.completed_at_estimated);
  const avgDaysToComplete = completedForDuration.length
    ? completedForDuration.reduce((sum, e) => sum + daysBetween(e.created_at, e.completed_at!), 0) /
      completedForDuration.length
    : null;

  const withDeadline = scoped.filter((e) => e.deadline);
  const delayedEntryIds = new Set(scopedDelays.map((d) => d.entry_id));
  const delayedWithDeadline = withDeadline.filter((e) => delayedEntryIds.has(e.id));

  const totalDelayDays = scopedDelays.reduce(
    (sum, d) => sum + Math.max(0, daysBetween(d.old_deadline, d.new_deadline)),
    0,
  );

  const projectCounts = new Map<string, number>();
  for (const e of scoped) {
    if (!e.project_id) continue;
    projectCounts.set(e.project_id, (projectCounts.get(e.project_id) ?? 0) + 1);
  }
  const priorityCounts: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const e of scoped) priorityCounts[e.priority || "P2"]++;

  return {
    scopedCount: scoped.length,
    completedCount: completed.length,
    monthlyCompletionRate: completionRate,
    completedInPeriodCount: completedInRange.length,
    onTimeNumerator: onTime.length,
    onTimeDenominator: completedWithDeadline.length,
    avgDaysToComplete,
    completedForDurationCount: completedForDuration.length,
    delayRateNumerator: delayedWithDeadline.length,
    delayRateDenominator: withDeadline.length,
    totalReschedules: scopedDelays.length,
    avgDelayDays: scopedDelays.length ? totalDelayDays / scopedDelays.length : null,
    projectCounts,
    priorityCounts,
  };
}

export function countOpen(entries: MetricsEntry[]) {
  return entries.filter((e) => e.entry_type !== "completed").length;
}

// Reschedules that actually *happened* in range, regardless of when the
// entry was created - distinct from computeWorklogMetrics()'s
// "totalReschedules" (which scopes by the entry's created_at, matching
// WorklogReport's own "Total reschedules" tile). For a weekly digest,
// "how many deadlines slipped this week" means the former.
export function countReschedulesInRange(delays: MetricsDelayLog[], range: Range) {
  return delays.filter((d) => inRange(d.created_at, range)).length;
}

// Monday 00:00 (local time) of the week containing `at`, through the
// following Monday 00:00 - exclusive end, same [from, to) convention as
// every other range here.
export function localWeekRange(at: Date): Range {
  const day = at.getDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = (day + 6) % 7;
  const start = new Date(at.getFullYear(), at.getMonth(), at.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { from: start, to: end };
}
