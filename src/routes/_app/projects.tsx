import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import {
  Card,
  EmptyState,
  Input,
  Textarea,
  Select,
  Button,
  Modal,
  Field,
  Badge,
} from "@/components/tnq/ui";
import { FolderKanban, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  given_name: string | null;
  domain: string | null;
  description: string | null;
  sme_owner_id: string | null;
  status: "active" | "paused" | "completed";
  audience_type: string | null;
  version: string | null;
  emoji_icon: string | null;
  current_owner_ids: string[] | null;
  previous_owner_ids: string[] | null;
  tasking_live?: boolean;
  last_updated?: string | null;
  last_updated_by?: string | null;
  links?: string | null;
  auditing_status?: "live" | "not_live" | null;
};

type SmeOption = {
  id: string;
  name: string | null;
  email: string | null;
  photo_url: string | null;
};

const STATUSES: Project["status"][] = ["active", "paused", "completed"];
const AUDIENCES = ["Contract", "Freelancers", "Internal Temporary", "Mixed", "N/A"];
const STATUS_TONE: Record<string, "success" | "warn" | "default"> = {
  active: "success",
  paused: "warn",
  completed: "default",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Live",
  paused: "Planning",
  completed: "Inactive",
};

function Avatars({ ids, smes }: { ids: string[]; smes: SmeOption[] }) {
  if (!ids?.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex -space-x-2">
      {ids.slice(0, 4).map((id) => {
        const s = smes.find((x) => x.id === id);
        const initial = (s?.name ?? s?.email ?? "?").slice(0, 1).toUpperCase();
        return s?.photo_url ? (
          <img
            key={id}
            src={s.photo_url}
            alt=""
            title={s?.name ?? s?.email ?? ""}
            className="h-7 w-7 rounded-full border-2 border-card"
          />
        ) : (
          <div
            key={id}
            title={s?.name ?? s?.email ?? ""}
            className="h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[11px] font-bold text-foreground"
          >
            {initial}
          </div>
        );
      })}
      {ids.length > 4 && (
        <div className="h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          +{ids.length - 4}
        </div>
      )}
    </div>
  );
}

function ProjectsPage() {
  const { role, user } = useAuth();
  const canWrite = role === "super_admin" || role === "tnq_team";
  const [items, setItems] = useState<Project[]>([]);
  const [smes, setSmes] = useState<SmeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({});
  const [tab, setTab] = useState<"all" | "active" | "paused" | "completed">("all");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as any) ?? []);
    const { data: smeRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["super_admin", "tnq_team"]);
    const ids = (smeRoles ?? []).map((r) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,name,email,photo_url")
        .in("id", ids);
      setSmes((profs ?? []) as any);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({
      name: "",
      given_name: "",
      emoji_icon: "📁",
      domain: "",
      description: "",
      status: "active",
      sme_owner_id: user?.id ?? null,
      audience_type: "N/A",
      version: "V1",
      current_owner_ids: user?.id ? [user.id] : [],
      previous_owner_ids: [],
      links: "",
      auditing_status: "not_live",
    });
    setOpen(true);
  }

  function startEdit(p: Project) {
    setEditing(p);
    setForm(p);
    setOpen(true);
  }

  async function save() {
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload: any = {
      name: form.name.trim(),
      given_name: form.given_name || null,
      domain: form.domain || null,
      description: form.description || null,
      sme_owner_id: form.sme_owner_id || null,
      status: form.status ?? "active",
      audience_type: form.audience_type || null,
      version: form.version || null,
      emoji_icon: form.emoji_icon || "📁",
      current_owner_ids: form.current_owner_ids ?? [],
      previous_owner_ids: form.previous_owner_ids ?? [],
      links: form.links?.trim() || null,
      auditing_status: form.auditing_status ?? "not_live",
      updated_by: user?.id ?? null,
      last_updated_by: user?.id ?? null,
    };
    if (editing) {
      // diff and log
      const FIELDS: (keyof Project)[] = [
        "name",
        "given_name",
        "status",
        "audience_type",
        "version",
        "sme_owner_id",
        "description",
        "links",
        "auditing_status",
      ];
      for (const f of FIELDS) {
        const oldV = (editing as any)[f] ?? "";
        const newV = (payload as any)[f] ?? "";
        if (String(oldV) !== String(newV)) {
          await supabase.from("activity_log").insert({
            user_id: user?.id ?? "",
            action: "field_updated",
            action_type: "project_update",
            target: editing.id,
            field_changed: f as string,
            old_value: String(oldV),
            new_value: String(newV),
          } as any);
        }
      }
    }
    const res = editing
      ? await supabase.from("projects").update(payload).eq("id", editing.id)
      : await supabase.from("projects").insert(payload);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    if (!editing && (res as any).data?.[0]?.id) {
      await supabase.from("activity_log").insert({
        user_id: user?.id ?? "",
        action: "project_created",
        action_type: "project_update",
        target: (res as any).data[0].id,
      } as any);
    }
    toast.success(editing ? "Project updated" : "Project created");
    setOpen(false);
    load();
  }
  async function remove(p: Project) {
    if (!confirm(`Delete project "${p.name}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  }

  const visible = useMemo(() => {
    let v = items;
    if (tab !== "all") v = v.filter((p) => p.status === tab);
    if (q.trim()) {
      const t = q.toLowerCase();
      v = v.filter(
        (p) => p.name.toLowerCase().includes(t) || (p.given_name ?? "").toLowerCase().includes(t),
      );
    }
    return v;
  }, [items, tab, q]);

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "all", label: "ALL PROJECTS" },
    { key: "active", label: "LIVE" },
    { key: "paused", label: "PLANNING" },
    { key: "completed", label: "INACTIVE" },
  ];

  function toggleId(field: "current_owner_ids" | "previous_owner_ids", id: string) {
    const cur = (form[field] as string[] | undefined) ?? [];
    setForm({ ...form, [field]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${
                tab === t.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-64 pl-8"
            />
          </div>
          {canWrite && (
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" /> New project
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card>
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban className="h-10 w-10" />}
            title="No projects to show."
            subtitle={canWrite ? "Create your first project to get started." : "Nothing here yet."}
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-3 py-3">Audience</th>
                  <th className="text-left px-3 py-3">Version</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-left px-3 py-3">Auditing</th>
                  <th className="text-left px-3 py-3">Link</th>
                  <th className="text-left px-3 py-3">Current Owners</th>
                  <th className="text-left px-3 py-3">Previous Owners</th>
                  {canWrite && <th className="px-3 py-3"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        to="/projects/$id"
                        params={{ id: p.id }}
                        className="flex items-center gap-3 group"
                      >
                        <span className="text-xl">{p.emoji_icon ?? "📁"}</span>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary">
                            {p.name}
                          </div>
                          {p.given_name && (
                            <div className="text-xs text-muted-foreground">{p.given_name}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone="info">{p.audience_type ?? "N/A"}</Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-foreground">
                      {p.version ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={p.auditing_status === "live" ? "success" : "default"}>
                        {p.auditing_status === "live" ? "Live" : "Not Live"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 max-w-[220px]">
                      {p.links ? (
                        <a
                          href={p.links}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline truncate inline-block max-w-full align-bottom"
                          title={p.links}
                        >
                          {p.links}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Avatars ids={p.current_owner_ids ?? []} smes={smes} />
                    </td>
                    <td className="px-3 py-3">
                      <Avatars ids={p.previous_owner_ids ?? []} smes={smes} />
                    </td>
                    {canWrite && (
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit project" : "New project"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Emoji">
            <Input
              value={form.emoji_icon ?? "📁"}
              onChange={(e) => setForm({ ...form, emoji_icon: e.target.value })}
              maxLength={4}
            />
          </Field>
          <Field label="Version">
            <Input
              value={form.version ?? ""}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="V1"
            />
          </Field>
        </div>
        <Field label="Project Name">
          <Input
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Agent Mode"
          />
        </Field>
        <Field label="Given Name / Client Name">
          <Input
            value={form.given_name ?? ""}
            onChange={(e) => setForm({ ...form, given_name: e.target.value })}
            placeholder="e.g. OpenAI Assistants Project"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Audience Type">
            <Select
              value={form.audience_type ?? "N/A"}
              onChange={(e) => setForm({ ...form, audience_type: e.target.value })}
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status ?? "active"}
              onChange={(e) => setForm({ ...form, status: e.target.value as Project["status"] })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Link (URL)">
            <Input
              value={form.links ?? ""}
              onChange={(e) => setForm({ ...form, links: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Auditing">
            <Select
              value={form.auditing_status ?? "not_live"}
              onChange={(e) =>
                setForm({ ...form, auditing_status: e.target.value as "live" | "not_live" })
              }
            >
              <option value="live">Live</option>
              <option value="not_live">Not Live</option>
            </Select>
          </Field>
        </div>
        <Field label="SME Owner">
          <Select
            value={form.sme_owner_id ?? ""}
            onChange={(e) => setForm({ ...form, sme_owner_id: e.target.value || null })}
          >
            <option value="">— Unassigned —</option>
            {smes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Current Owner(s)">
          <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-32 overflow-y-auto">
            {smes.map((s) => {
              const sel = (form.current_owner_ids ?? []).includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleId("current_owner_ids", s.id)}
                  className={`text-xs px-2 py-1 rounded-full border ${sel ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-accent"}`}
                >
                  {s.name ?? s.email}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Previous Owner(s)">
          <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-32 overflow-y-auto">
            {smes.map((s) => {
              const sel = (form.previous_owner_ids ?? []).includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleId("previous_owner_ids", s.id)}
                  className={`text-xs px-2 py-1 rounded-full border ${sel ? "bg-muted-foreground text-background border-muted-foreground" : "border-border text-foreground hover:bg-accent"}`}
                >
                  {s.name ?? s.email}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}

export const Route = createFileRoute("/_app/projects")({ component: ProjectsPage });
