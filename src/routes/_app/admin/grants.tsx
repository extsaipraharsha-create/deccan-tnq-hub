import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Field,
  Modal,
  EmptyState,
  Badge,
} from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Plus, Trash2, KeyRound } from "lucide-react";

interface Grant {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  permission: string;
  granted_at: string;
}
interface Prof {
  id: string;
  name: string | null;
  email: string | null;
}

function GrantsPage() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user_id: "",
    resource_type: "project",
    resource_id: "",
    permission: "view_only",
  });

  async function load() {
    setLoading(true);
    const [{ data: g }, { data: p }] = await Promise.all([
      supabase.from("resource_grants").select("*").order("granted_at", { ascending: false }),
      supabase.from("profiles").select("id,name,email").order("name"),
    ]);
    setGrants((g as Grant[]) ?? []);
    setProfiles((p as Prof[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!form.user_id || !form.resource_id) return;
    await supabase
      .from("resource_grants")
      .insert({ ...form, permission: form.permission as any, granted_by: user?.id ?? null });
    setOpen(false);
    setForm({ user_id: "", resource_type: "project", resource_id: "", permission: "view_only" });
    load();
  }
  async function revoke(id: string) {
    if (!confirm("Revoke this grant?")) return;
    await supabase.from("resource_grants").delete().eq("id", id);
    load();
  }
  const who = (id: string) =>
    profiles.find((p) => p.id === id)?.name ?? profiles.find((p) => p.id === id)?.email ?? id;

  return (
    <div>
      <PageHeader
        title="Admin · Resource grants"
        subtitle="Explicit access to projects, playgrounds, or learning paths."
        right={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Grant access
          </Button>
        }
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : grants.length === 0 ? (
          <EmptyState icon={<KeyRound className="h-10 w-10" />} title="No grants yet" />
        ) : (
          <div className="divide-y divide-border -m-5">
            {grants.map((g) => (
              <div key={g.id} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{who(g.user_id)}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {g.resource_type} · {g.resource_id}
                  </div>
                </div>
                <Badge tone="info">{g.permission}</Badge>
                <Button size="sm" variant="ghost" onClick={() => revoke(g.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Grant access"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Grant</Button>
          </>
        }
      >
        <Field label="User">
          <Select
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          >
            <option value="">Select user…</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Resource type">
          <Select
            value={form.resource_type}
            onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
          >
            <option value="project">Project</option>
            <option value="playground">Playground</option>
            <option value="learning_path">Learning Path</option>
            <option value="resource">Resource</option>
          </Select>
        </Field>
        <Field label="Resource ID">
          <Input
            value={form.resource_id}
            onChange={(e) => setForm({ ...form, resource_id: e.target.value })}
            placeholder="uuid…"
          />
        </Field>
        <Field label="Permission">
          <Select
            value={form.permission}
            onChange={(e) => setForm({ ...form, permission: e.target.value })}
          >
            <option value="view_only">View only</option>
            <option value="can_edit">Can edit</option>
            <option value="can_upload">Can upload</option>
            <option value="full_access">Full access</option>
          </Select>
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/grants")({ component: GrantsPage });
