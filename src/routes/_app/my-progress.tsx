import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { TrendingUp, Award } from "lucide-react";

interface Prog {
  id: string;
  learning_path_id: string | null;
  module_id: string | null;
  status: string;
  completed_at: string | null;
  updated_at: string;
}
interface Achievement {
  id: string;
  achievement_type: string;
  earned_at: string;
}

function MyProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Prog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase
          .from("contributor_progress")
          .select("*")
          .eq("contributor_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("contributor_achievements")
          .select("*")
          .eq("contributor_id", user.id)
          .order("earned_at", { ascending: false }),
      ]);
      setProgress((p as Prog[]) ?? []);
      setAchievements((a as Achievement[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const complete = progress.filter((p) => p.status === "complete").length;

  return (
    <div>
      <PageHeader title="My progress" subtitle="Modules completed and achievements earned" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="text-xs text-muted-foreground uppercase">Modules completed</div>
          <div className="mt-2 text-3xl font-semibold">{complete}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase">In progress</div>
          <div className="mt-2 text-3xl font-semibold">
            {progress.filter((p) => p.status === "in_progress").length}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase">Achievements</div>
          <div className="mt-2 text-3xl font-semibold">{achievements.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Recent activity
          </h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : progress.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No progress yet" />
          ) : (
            <ul className="space-y-2">
              {progress.slice(0, 10).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
                >
                  <span className="text-muted-foreground font-mono text-xs truncate">
                    {(p.module_id ?? "").slice(0, 8)}…
                  </span>
                  <Badge
                    tone={
                      p.status === "complete"
                        ? "success"
                        : p.status === "in_progress"
                          ? "info"
                          : "default"
                    }
                  >
                    {p.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" /> Achievements
          </h2>
          {achievements.length === 0 ? (
            <EmptyState
              icon={<Award className="h-8 w-8" />}
              title="No achievements yet"
              subtitle="Complete modules to earn them."
            />
          ) : (
            <ul className="space-y-2">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{a.achievement_type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.earned_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
export const Route = createFileRoute("/_app/my-progress")({ component: MyProgressPage });
