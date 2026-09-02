/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, StatCard, Badge, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { FolderKanban, AlertTriangle, Trophy, Flame } from "lucide-react";

type EntryType =
  | "working_on"
  | "need_help"
  | "completed"
  | "blocked"
  | "review_needed"
  | "available_to_help";
interface Entry {
  id: string;
  project_id: string | null;
  entry_type: EntryType;
  completed_at: string | null;
  created_at: string;
}
interface DelayLog {
  id: string;
  old_deadline: string;
  new_deadline: string;
}
interface Project {
  id: string;
  name: string;
  emoji_icon: string | null;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(entries: Entry[]): number {
  const days = new Set(entries.map((e) => dayKey(e.created_at)));
  const cursor = new Date();
  // Don't zero out the streak just because today hasn't been posted to yet —
  // start counting from yesterday if today's empty.
  if (!days.has(dayKey(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function MyReportPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [delays, setDelays] = useState<DelayLog[]>([]);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [recognitionCount, setRecognitionCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [{ data: e }, { data: dl }, { data: sc }, { data: rc }, { data: pj }] = await Promise.all(
      [
        supabase
          .from("work_log_entries")
          .select("id,project_id,entry_type,completed_at,created_at")
          .eq("user_id", user.id),
        (supabase as any)
          .from("work_log_delay_log")
          .select("id,old_deadline,new_deadline")
          .eq("user_id", user.id),
        supabase.from("quality_scores").select("score").eq("contributor_id", user.id),
        (supabase as any).from("recognition_recipients").select("id").eq("contributor_id", user.id),
        supabase.from("projects").select("id,name,emoji_icon"),
      ],
    );
    setEntries((e as any) ?? []);
    setDelays((dl as DelayLog[]) ?? []);
    const scores = (sc as { score: number }[]) ?? [];
    setAvgScore(
      scores.length ? scores.reduce((a, b) => a + Number(b.score), 0) / scores.length : null,
    );
    setRecognitionCount((rc as any[])?.length ?? 0);
    setProjects((pj as Project[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user]);
  useAutoRefresh(load);

  if (loading) {
    return (
      <div>
        <PageHeader title="My Report" subtitle="Your worklog activity, all in one place" />
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const completedAllTime = entries.filter((e) => e.completed_at).length;
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const completedThisMonth = entries.filter(
    (e) => e.completed_at && e.completed_at.slice(0, 7) === monthKey,
  ).length;
  const completionRate = entries.length ? Math.round((completedAllTime / entries.length) * 100) : 0;
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
        (sum, d) => sum + (new Date(d.new_deadline).getTime() - new Date(d.old_deadline).getTime()),
        0,
      ) /
      delays.length /
      (1000 * 60 * 60)
    : 0;
  const blockedCount = entries.filter((e) => e.entry_type === "blocked").length;
  const blockedPct = entries.length ? Math.round((blockedCount / entries.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Report" subtitle="Your worklog activity, all in one place" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completed" value={completedAllTime} suffix="all-time" />
        <StatCard label="Completed" value={completedThisMonth} suffix="this month" />
        <StatCard label="Completion rate" value={completionRate} suffix="%" />
        <StatCard label="Current streak" value={streak} suffix={streak === 1 ? "day" : "days"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <FolderKanban className="h-4 w-4 text-primary" />
            <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
              Project contribution
            </div>
          </div>
          {rankedProjects.length === 0 ? (
            <EmptyState title="No projects yet" icon={<FolderKanban className="h-8 w-8" />} />
          ) : (
            <div className="space-y-2">
              {rankedProjects.map((r, i) => (
                <div
                  key={r.project.id}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                >
                  <span className="text-sm text-foreground">
                    {r.project.emoji_icon ?? "📁"} {r.project.name}
                  </span>
                  <div className="flex items-center gap-2">
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
                {delays.length ? `${avgDelayHours.toFixed(1)}h` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blocked entries</span>
              <span className="font-mono font-semibold">
                {blockedCount} ({blockedPct}%)
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
  );
}
export const Route = createFileRoute("/_app/my-report")({ component: MyReportPage });
