import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Field,
  Modal,
  Badge,
  EmptyState,
} from "@/components/tnq/ui";
import { Plus, Pencil, ExternalLink, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  emoji_icon: string | null;
  audience_type: string | null;
};
type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type Resource = {
  id: string;
  project_id: string;
  poc_user_id: string | null;
  doc_label: string | null;
  doc_url: string | null;
  video_label: string | null;
  video_url: string | null;
  notes: string | null;
  last_updated: string;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NewcomersPage() {
  const { user, role } = useAuth();
  const canWrite = role === "super_admin" || role === "tnq_team";
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Resource>>({});

  async function load() {
    const [{ data: p }, { data: pr }, { data: r }] = await Promise.all([
      supabase.from("projects").select("id,name,emoji_icon,audience_type").order("name"),
      supabase.from("profiles").select("id,name,email,photo_url"),
      (supabase.from("newcomer_resources" as any) as any).select("*"),
    ]);
    setProjects((p as any) ?? []);
    setProfiles((pr as any) ?? []);
    setResources((r as any) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const list = projects.filter((p) => tab === "all" || p.id === tab);
    return list.map((p) => ({
      project: p,
      res: resources.find((r) => r.project_id === p.id) ?? null,
    }));
  }, [projects, resources, tab]);

  function startEdit(projectId: string) {
    const existing = resources.find((r) => r.project_id === projectId);
    setForm(existing ? { ...existing } : { project_id: projectId });
    setOpen(true);
  }
  async function save() {
    if (!form.project_id) return toast.error("Select a project");
    const payload: any = {
      project_id: form.project_id,
      poc_user_id: form.poc_user_id || null,
      doc_label: form.doc_label || null,
      doc_url: form.doc_url || null,
      video_label: form.video_label || null,
      video_url: form.video_url || null,
      notes: form.notes || null,
      last_updated_by: user?.id ?? null,
    };
    const tbl = supabase.from("newcomer_resources" as any) as any;
    const existing = resources.find((r) => r.project_id === form.project_id);
    const res = existing
      ? await tbl.update(payload).eq("id", existing.id)
      : await tbl.insert(payload);
    if (res.error) return toast.error(res.error.message);
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? "",
      action: existing ? "newcomer_updated" : "newcomer_added",
      action_type: "newcomer_resources",
      target: form.project_id,
    } as any);
    toast.success("Saved");
    setOpen(false);
    setForm({});
    load();
  }

  return (
    <div>
      <PageHeader
        title="Newcomers"
        subtitle="Onboarding resources for each project in one place."
        right={
          canWrite && (
            <Button
              onClick={() => {
                setForm({});
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add / Edit info
            </Button>
          )
        }
      />

      {/* Project tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setTab("all")}
          className={`font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${
            tab === "all"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ALL PROJECTS
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setTab(p.id)}
            className={`font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${
              tab === p.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.emoji_icon ?? "📁"} {p.name.toUpperCase()}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<GraduationCap className="h-10 w-10" />} title="No projects yet" />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-3 py-3">POC</th>
                  <th className="text-left px-3 py-3">Documentation</th>
                  <th className="text-left px-3 py-3">Video</th>
                  <th className="text-left px-3 py-3">Notes</th>
                  <th className="text-left px-3 py-3">Last Updated</th>
                  {canWrite && <th className="px-3 py-3 w-20"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ project: p, res: r }) => {
                  const poc = profiles.find((x) => x.id === r?.poc_user_id);
                  return (
                    <tr key={p.id} className="hover:bg-accent/30 align-top">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.emoji_icon ?? "📁"}</span>
                          <div>
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <Badge tone="info">{p.audience_type ?? "N/A"}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {poc ? (
                          <div className="flex items-center gap-2">
                            {poc.photo_url ? (
                              <img src={poc.photo_url} alt="" className="h-7 w-7 rounded-full" />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                                {(poc.name ?? poc.email ?? "?")[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-foreground font-medium">
                              {poc.name ?? poc.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">— Not added</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {r?.doc_url ? (
                          <a
                            href={r.doc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {r.doc_label ?? "Doc"} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">— Not added</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {r?.video_url ? (
                          <a
                            href={r.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {r.video_label ?? "Video"} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">— Not added</span>
                        )}
                      </td>
                      <td className="px-3 py-3 max-w-[260px]">
                        {r?.notes ? (
                          <div className="text-foreground text-xs">{r.notes}</div>
                        ) : (
                          <span className="text-xs text-muted-foreground">— Not added</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {fmtDate(r?.last_updated)}
                      </td>
                      {canWrite && (
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => startEdit(p.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Newcomer info"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <Field label="Project">
          <Select
            value={form.project_id ?? ""}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Point of contact">
          <Select
            value={form.poc_user_id ?? ""}
            onChange={(e) => setForm({ ...form, poc_user_id: e.target.value })}
          >
            <option value="">— Unassigned —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Doc label">
            <Input
              value={form.doc_label ?? ""}
              onChange={(e) => setForm({ ...form, doc_label: e.target.value })}
              placeholder="e.g. Onboarding Doc"
            />
          </Field>
          <Field label="Doc URL">
            <Input
              value={form.doc_url ?? ""}
              onChange={(e) => setForm({ ...form, doc_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Video label">
            <Input
              value={form.video_label ?? ""}
              onChange={(e) => setForm({ ...form, video_label: e.target.value })}
              placeholder="e.g. Walkthrough"
            />
          </Field>
          <Field label="Video URL">
            <Input
              value={form.video_url ?? ""}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
        </div>
        <Field label="Additional notes">
          <Textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}

export const Route = createFileRoute("/_app/newcomers")({ component: NewcomersPage });
