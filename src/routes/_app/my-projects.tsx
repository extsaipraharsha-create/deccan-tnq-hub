import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { FolderKanban } from "lucide-react";

interface Proj {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

function MyProjectsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Proj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase
        .from("contributors")
        .select("projects")
        .eq("id", user.id)
        .maybeSingle();
      const ids: string[] = (c as any)?.projects ?? [];
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("projects")
        .select("id,name,description,status")
        .in("id", ids);
      setRows((p as Proj[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <PageHeader title="My projects" subtitle="Projects you are assigned to" />
      {loading ? (
        <Card>
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban className="h-10 w-10" />}
            title="No projects assigned"
            subtitle="Ask your SME to add you to a project."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <Badge
                  tone={
                    p.status === "active" ? "success" : p.status === "paused" ? "warn" : "default"
                  }
                >
                  {p.status}
                </Badge>
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
export const Route = createFileRoute("/_app/my-projects")({ component: MyProjectsPage });
