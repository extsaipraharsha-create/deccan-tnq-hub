import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Input, Field, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Plus, Trash2 } from "lucide-react";

interface Row {
  id: string;
  key: string;
  value: string | null;
}

function SettingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [k, setK] = useState("");
  const [v, setV] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").order("key");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!k.trim()) return;
    await supabase.from("settings").upsert({ key: k.trim(), value: v }, { onConflict: "key" });
    setK("");
    setV("");
    load();
  }
  async function save(r: Row) {
    await supabase.from("settings").update({ value: r.value }).eq("id", r.id);
  }
  async function remove(id: string) {
    if (!confirm("Delete this setting?")) return;
    await supabase.from("settings").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Admin · System settings"
        subtitle="Key/value configuration. Changes are saved per row."
      />
      <Card className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
          <Field label="Key">
            <Input
              value={k}
              onChange={(e) => setK(e.target.value)}
              placeholder="e.g. maintenance_mode"
            />
          </Field>
          <Field label="Value">
            <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. true" />
          </Field>
          <Button onClick={add}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </Card>
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground p-4">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<SettingsIcon className="h-10 w-10" />}
            title="No settings yet"
            subtitle="Add your first key/value above."
          />
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-2 items-center p-2 rounded-lg border border-border bg-background"
              >
                <div className="font-mono text-sm">{r.key}</div>
                <Input
                  value={r.value ?? ""}
                  onChange={(e) =>
                    setRows(rows.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))
                  }
                />
                <Button size="sm" variant="secondary" onClick={() => save(r)}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_app/admin/settings")({ component: SettingsPage });
