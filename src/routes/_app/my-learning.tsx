import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge, Button } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { GraduationCap, Check } from "lucide-react";

interface Path {
  id: string;
  name: string;
}
interface Module {
  id: string;
  learning_path_id: string;
  title: string;
  type: string;
  order_index: number;
  estimated_minutes: number | null;
}
interface Progress {
  module_id: string | null;
  status: string;
}

function MyLearningPage() {
  const { user } = useAuth();
  const [path, setPath] = useState<Path | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: c } = await supabase
      .from("contributors")
      .select("learning_path_id")
      .eq("id", user.id)
      .maybeSingle();
    const pid = (c as any)?.learning_path_id;
    if (!pid) {
      setLoading(false);
      return;
    }
    const [{ data: p }, { data: m }, { data: pr }] = await Promise.all([
      supabase.from("learning_paths").select("id,name").eq("id", pid).maybeSingle(),
      supabase
        .from("learning_path_modules")
        .select("*")
        .eq("learning_path_id", pid)
        .order("order_index"),
      supabase
        .from("contributor_progress")
        .select("module_id,status")
        .eq("contributor_id", user.id),
    ]);
    setPath(p as Path | null);
    setModules((m as Module[]) ?? []);
    setProgress((pr as Progress[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [user]);

  async function complete(moduleId: string) {
    if (!user) return;
    await supabase.from("contributor_progress").upsert(
      {
        contributor_id: user.id,
        module_id: moduleId,
        status: "complete",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "contributor_id,module_id" } as any,
    );
    load();
  }

  const isDone = (mid: string) => progress.find((p) => p.module_id === mid)?.status === "complete";
  const done = modules.filter((m) => isDone(m.id)).length;
  const pct = modules.length ? Math.round((done / modules.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="My learning" subtitle={path?.name ?? "No learning path assigned"} />
      {loading ? (
        <Card>
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : !path ? (
        <Card>
          <EmptyState
            icon={<GraduationCap className="h-10 w-10" />}
            title="No path yet"
            subtitle="Your SME hasn't assigned a learning path."
          />
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {done}/{modules.length} · {pct}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </Card>
          <div className="space-y-2">
            {modules.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {m.order_index + 1}. {m.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.type} {m.estimated_minutes && `· ${m.estimated_minutes} min`}
                    </div>
                  </div>
                  {isDone(m.id) ? (
                    <Badge tone="success">
                      <Check className="h-3 w-3 mr-1" /> Done
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => complete(m.id)}>
                      Mark complete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export const Route = createFileRoute("/_app/my-learning")({ component: MyLearningPage });
