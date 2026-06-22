import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Target, AlertCircle } from "lucide-react";

interface Score {
  id: string;
  score: number;
  review_date: string;
  notes: string | null;
  project_id: string | null;
}
interface Issue {
  id: string;
  issue: string;
  status: string;
  date: string;
  project_id: string | null;
}

function MyScoresPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: i }] = await Promise.all([
        supabase
          .from("quality_scores")
          .select("*")
          .eq("contributor_id", user.id)
          .order("review_date", { ascending: false }),
        supabase
          .from("quality_issues")
          .select("*")
          .eq("contributor_id", user.id)
          .order("date", { ascending: false }),
      ]);
      setScores((s as Score[]) ?? []);
      setIssues((i as Issue[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const avg = scores.length
    ? (scores.reduce((a, b) => a + Number(b.score), 0) / scores.length).toFixed(1)
    : "—";
  const open = issues.filter((i) => i.status === "open").length;

  return (
    <div>
      <PageHeader title="My quality scores" subtitle="Reviews and feedback from your SMEs" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="text-xs text-muted-foreground uppercase">Average score</div>
          <div className="mt-2 text-3xl font-semibold">{avg}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase">Reviews</div>
          <div className="mt-2 text-3xl font-semibold">{scores.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase">Open issues</div>
          <div className="mt-2 text-3xl font-semibold">{open}</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" /> Score history
          </h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : scores.length === 0 ? (
            <EmptyState icon={<Target className="h-8 w-8" />} title="No reviews yet" />
          ) : (
            <ul className="space-y-2">
              {scores.map((s) => (
                <li key={s.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{Number(s.score).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.review_date).toLocaleDateString()}
                    </span>
                  </div>
                  {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Issues
          </h2>
          {issues.length === 0 ? (
            <EmptyState icon={<AlertCircle className="h-8 w-8" />} title="No issues raised" />
          ) : (
            <ul className="space-y-2">
              {issues.map((i) => (
                <li key={i.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{i.issue}</span>
                    <Badge tone={i.status === "open" ? "warn" : "success"}>{i.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(i.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
export const Route = createFileRoute("/_app/my-scores")({ component: MyScoresPage });
