import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, Input, Badge, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText } from "lucide-react";

interface Row {
  id: string;
  user_id: string | null;
  action: string;
  action_type: string;
  target: string | null;
  details: any;
  timestamp: string;
}

const TONE: Record<string, "success" | "warn" | "danger" | "info" | "default"> = {
  created: "success",
  updated: "info",
  deleted: "danger",
  login: "default",
  role_changed: "warn",
  grant_added: "success",
  grant_revoked: "warn",
};

function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter(
      (r) =>
        !t ||
        r.action.toLowerCase().includes(t) ||
        (r.target ?? "").toLowerCase().includes(t) ||
        r.action_type.includes(t),
    );
  }, [rows, q]);

  return (
    <div>
      <PageHeader
        title="Admin · Audit log"
        subtitle="Most recent 500 events."
        right={
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
        }
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<ScrollText className="h-10 w-10" />} title="No activity yet" />
        ) : (
          <div className="divide-y divide-border -m-5">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex items-start gap-3">
                <Badge tone={TONE[r.action_type] ?? "default"}>{r.action_type}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{r.action}</div>
                  {r.target && (
                    <div className="text-xs text-muted-foreground truncate">{r.target}</div>
                  )}
                  {r.details && (
                    <pre className="mt-1 text-xs text-muted-foreground bg-muted/40 rounded p-2 overflow-x-auto">
                      {JSON.stringify(r.details, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/audit")({ component: AuditPage });
