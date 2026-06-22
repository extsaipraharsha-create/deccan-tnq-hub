import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Beaker, FileText, ExternalLink } from "lucide-react";

interface PG {
  id: string;
  name: string;
  status: string;
  progress_percent: number;
  description: string | null;
  access_url: string | null;
}
interface Doc {
  id: string;
  name: string;
  type: string | null;
  url: string;
  uploaded_at: string;
}
interface Item {
  id: string;
  component_name: string;
  status: string;
  notes: string | null;
}

function MyPlaygroundPage() {
  const { user } = useAuth();
  const [pg, setPg] = useState<PG | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase
        .from("contributors")
        .select("playground_id")
        .eq("id", user.id)
        .maybeSingle();
      const pid = (c as any)?.playground_id;
      if (!pid) {
        setLoading(false);
        return;
      }
      const [{ data: p }, { data: d }, { data: i }] = await Promise.all([
        supabase
          .from("playgrounds")
          .select("id,name,status,progress_percent,description,access_url")
          .eq("id", pid)
          .maybeSingle(),
        supabase
          .from("playground_documents")
          .select("id,name,type,url,uploaded_at")
          .eq("playground_id", pid)
          .order("uploaded_at", { ascending: false }),
        supabase
          .from("playground_content_items")
          .select("id,component_name,status,notes")
          .eq("playground_id", pid)
          .order("last_updated", { ascending: false }),
      ]);
      setPg(p as PG | null);
      setDocs((d as Doc[]) ?? []);
      setItems((i as Item[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <PageHeader title="My playground" subtitle={pg?.name ?? "No playground assigned"} />
      {loading ? (
        <Card>
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : !pg ? (
        <Card>
          <EmptyState
            icon={<Beaker className="h-10 w-10" />}
            title="No playground yet"
            subtitle="Your SME will provision one."
          />
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {pg.description && (
                  <p className="text-sm text-muted-foreground">{pg.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Badge tone="info">{pg.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {pg.progress_percent}% complete
                  </span>
                </div>
              </div>
              {pg.access_url && (
                <a
                  href={pg.access_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${pg.progress_percent}%` }} />
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documents
              </h2>
              {docs.length === 0 ? (
                <EmptyState icon={<FileText className="h-8 w-8" />} title="No documents" />
              ) : (
                <ul className="space-y-2">
                  {docs.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                    >
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 truncate"
                      >
                        {d.name} <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-xs text-muted-foreground">{d.type ?? "file"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h2 className="font-semibold mb-3">Components</h2>
              {items.length === 0 ? (
                <EmptyState title="No components yet" />
              ) : (
                <ul className="space-y-2">
                  {items.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium">{i.component_name}</div>
                        {i.notes && <div className="text-xs text-muted-foreground">{i.notes}</div>}
                      </div>
                      <Badge
                        tone={
                          i.status === "completed"
                            ? "success"
                            : i.status === "in_progress"
                              ? "info"
                              : i.status === "needs_revision"
                                ? "warn"
                                : "default"
                        }
                      >
                        {i.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
export const Route = createFileRoute("/_app/my-playground")({ component: MyPlaygroundPage });
