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
import { Plus, Trash2, ExternalLink, FolderInput } from "lucide-react";

interface Row {
  id: string;
  contributor_id: string | null;
  project_id: string | null;
  source_type: string | null;
  url: string | null;
  uploaded_by: string | null;
  created_at: string;
}
interface Proj {
  id: string;
  name: string;
}
interface Prof {
  id: string;
  name: string | null;
  email: string | null;
}

function SourcesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Proj[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    contributor_id: "",
    project_id: "",
    source_type: "doc",
    url: "",
  });

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: p }, { data: pr }] = await Promise.all([
      supabase.from("admin_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id,name").order("name"),
      supabase.from("profiles").select("id,name,email").order("name"),
    ]);
    setRows((s as Row[]) ?? []);
    setProjects((p as Proj[]) ?? []);
    setProfiles((pr as Prof[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!form.url.trim()) return;
    await supabase.from("admin_sources").insert({
      contributor_id: form.contributor_id || null,
      project_id: form.project_id || null,
      source_type: form.source_type,
      url: form.url.trim(),
      uploaded_by: user?.id ?? null,
    });
    setOpen(false);
    setForm({ contributor_id: "", project_id: "", source_type: "doc", url: "" });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this source?")) return;
    await supabase.from("admin_sources").delete().eq("id", id);
    load();
  }

  const name = (id: string | null) =>
    profiles.find((p) => p.id === id)?.name ?? profiles.find((p) => p.id === id)?.email ?? "—";
  const proj = (id: string | null) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Admin · Sources"
        subtitle="External reference links per project or contributor."
        right={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add source
          </Button>
        }
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FolderInput className="h-10 w-10" />}
            title="No sources yet"
            subtitle="Add references contributors can use."
          />
        ) : (
          <div className="divide-y divide-border -m-5">
            {rows.map((r) => (
              <div key={r.id} className="p-4 flex items-center gap-3">
                <Badge tone="info">{r.source_type ?? "link"}</Badge>
                <div className="flex-1 min-w-0">
                  <a
                    href={r.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate inline-flex items-center gap-1"
                  >
                    {r.url} <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {proj(r.project_id)} · {name(r.contributor_id)}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
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
        title="Add source"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add</Button>
          </>
        }
      >
        <Field label="URL">
          <Input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://…"
          />
        </Field>
        <Field label="Type">
          <Select
            value={form.source_type}
            onChange={(e) => setForm({ ...form, source_type: e.target.value })}
          >
            <option value="doc">Document</option>
            <option value="sheet">Sheet</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </Select>
        </Field>
        <Field label="Project (optional)">
          <Select
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
          >
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Contributor (optional)">
          <Select
            value={form.contributor_id}
            onChange={(e) => setForm({ ...form, contributor_id: e.target.value })}
          >
            <option value="">—</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/sources")({ component: SourcesPage });
