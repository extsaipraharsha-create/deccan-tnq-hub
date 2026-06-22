import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, Input, Select, Badge, EmptyState, Button } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { Users2 } from "lucide-react";

interface Row {
  id: string;
  sme_id: string | null;
  onboarding_status: string;
  onboarding_stage: number;
  learning_path_id: string | null;
  playground_id: string | null;
  last_active_at: string | null;
  name?: string | null;
  email?: string | null;
}
interface Prof {
  id: string;
  name: string | null;
  email: string | null;
}

function ContributorsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [smes, setSmes] = useState<Prof[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: p }, { data: ur }] = await Promise.all([
      supabase.from("contributors").select("*"),
      supabase.from("profiles").select("id,name,email"),
      supabase.from("user_roles").select("user_id,role").in("role", ["tnq_team", "super_admin"]),
    ]);
    const pmap = new Map(((p as Prof[]) ?? []).map((x) => [x.id, x]));
    setProfiles((p as Prof[]) ?? []);
    setSmes(((ur as any[]) ?? []).map((x) => pmap.get(x.user_id)).filter(Boolean) as Prof[]);
    setRows(
      ((c as Row[]) ?? []).map((r) => ({
        ...r,
        name: pmap.get(r.id)?.name,
        email: pmap.get(r.id)?.email,
      })),
    );
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function assignSme(id: string, sme_id: string) {
    await supabase
      .from("contributors")
      .update({ sme_id: sme_id || null })
      .eq("id", id);
    setRows(rows.map((r) => (r.id === id ? { ...r, sme_id: sme_id || null } : r)));
  }
  async function setStage(id: string, stage: number) {
    const status = stage >= 5 ? "complete" : stage > 1 ? "in_progress" : "not_started";
    await supabase
      .from("contributors")
      .update({ onboarding_stage: stage, onboarding_status: status })
      .eq("id", id);
    setRows(
      rows.map((r) =>
        r.id === id ? { ...r, onboarding_stage: stage, onboarding_status: status } : r,
      ),
    );
  }

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter(
      (r) =>
        !t || (r.name ?? "").toLowerCase().includes(t) || (r.email ?? "").toLowerCase().includes(t),
    );
  }, [rows, q]);

  const smeName = (id: string | null) => profiles.find((p) => p.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Contributors"
        subtitle={`${rows.length} total`}
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
          <EmptyState
            icon={<Users2 className="h-10 w-10" />}
            title="No contributors yet"
            subtitle="Approve users with the contributor role from Admin → Users."
          />
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Contributor</th>
                  <th className="text-left p-3">SME</th>
                  <th className="text-left p-3">Stage</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-medium">{r.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={r.sme_id ?? ""}
                        onChange={(e) => assignSme(r.id, e.target.value)}
                        className="w-48"
                      >
                        <option value="">Unassigned</option>
                        {smes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name ?? s.email}
                          </option>
                        ))}
                      </Select>
                      <div className="text-xs text-muted-foreground mt-1">{smeName(r.sme_id)}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStage(r.id, Math.max(1, r.onboarding_stage - 1))}
                        >
                          −
                        </Button>
                        <span className="w-6 text-center font-medium">{r.onboarding_stage}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStage(r.id, Math.min(5, r.onboarding_stage + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        tone={
                          r.onboarding_status === "complete"
                            ? "success"
                            : r.onboarding_status === "in_progress"
                              ? "info"
                              : "default"
                        }
                      >
                        {r.onboarding_status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {r.last_active_at ? new Date(r.last_active_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
export const Route = createFileRoute("/_app/contributors")({ component: ContributorsPage });
