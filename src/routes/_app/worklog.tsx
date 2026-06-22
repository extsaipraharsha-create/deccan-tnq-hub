import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Card, Button, Textarea, Select, Input, Badge, EmptyState } from "@/components/tnq/ui";
import { MessageSquare, Send, Pencil, Trash2, Download, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

type EntryType = "working_on" | "need_help" | "completed" | "blocked" | "review_needed";
type Entry = {
  id: string;
  user_id: string;
  content: string;
  project_id: string | null;
  entry_type: EntryType;
  created_at: string;
};
type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type Project = { id: string; name: string; emoji_icon: string | null };

const TYPES: {
  key: EntryType;
  label: string;
  tone: "info" | "warn" | "success" | "danger" | "default";
}[] = [
  { key: "working_on", label: "Working On", tone: "info" },
  { key: "need_help", label: "Need Help", tone: "warn" },
  { key: "completed", label: "Completed", tone: "success" },
  { key: "blocked", label: "Blocked", tone: "danger" },
  { key: "review_needed", label: "Review Needed", tone: "default" },
];
const TYPE_LABEL: Record<EntryType, string> = Object.fromEntries(
  TYPES.map((t) => [t.key, t.label]),
) as any;
const TYPE_TONE: Record<EntryType, any> = Object.fromEntries(
  TYPES.map((t) => [t.key, t.tone]),
) as any;

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function fmtDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const TODAY = dayKey(new Date().toISOString());

function WorkLogPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "super_admin";
  const canPost = role === "super_admin" || role === "tnq_team";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [entryType, setEntryType] = useState<EntryType>("working_on");

  const [filterType, setFilterType] = useState<"all" | EntryType>("all");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dateMode, setDateMode] = useState<"all" | "day" | "month">("all");
  const [dateValue, setDateValue] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<EntryType>("working_on");

  const sb: any = supabase;

  async function load() {
    const [{ data: e }, { data: p }, { data: pr }] = await Promise.all([
      sb.from("work_log_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,name,email,photo_url"),
      supabase.from("projects").select("id,name,emoji_icon"),
    ]);
    setEntries((e as any) ?? []);
    setProfiles((p as any) ?? []);
    setProjects((pr as any) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel("worklog-table")
      .on("postgres_changes", { event: "*", schema: "public", table: "work_log_entries" }, () => {
        sb.from("work_log_entries")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data }: any) => setEntries((data as any) ?? []));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function post() {
    const t = content.trim();
    if (!t) return;
    if (t.length > 500) return toast.error("Max 500 characters");
    const { error } = await sb.from("work_log_entries").insert({
      user_id: user!.id,
      content: t,
      project_id: projectId || null,
      entry_type: entryType,
    });
    if (error) return toast.error(error.message);
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? "",
      action: "worklog_post",
      action_type: "work_log",
      details: { type: entryType },
    } as any);
    setContent("");
    setProjectId("");
    setEntryType("working_on");
    toast.success("Posted");
  }

  function startEdit(e: Entry) {
    setEditId(e.id);
    setEditContent(e.content);
    setEditType(e.entry_type);
  }
  async function saveEdit(id: string) {
    const { error } = await sb
      .from("work_log_entries")
      .update({ content: editContent, entry_type: editType })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setEditId(null);
    toast.success("Updated");
  }
  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await sb.from("work_log_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  }

  // Step 1: filter entries
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterType !== "all" && e.entry_type !== filterType) return false;
      if (filterUser && e.user_id !== filterUser) return false;
      if (filterProject && e.project_id !== filterProject) return false;
      if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateMode === "day" && dateValue && dayKey(e.created_at) !== dateValue) return false;
      if (dateMode === "month" && dateValue && monthKey(e.created_at) !== dateValue) return false;
      return true;
    });
  }, [entries, filterType, filterUser, filterProject, search, dateMode, dateValue]);

  // Step 2: group by (user_id + day). For today, keep only the most recent per user.
  type Group = { key: string; user_id: string; day: string; entries: Entry[] };
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    for (const e of filtered) {
      const d = dayKey(e.created_at);
      const k = `${e.user_id}|${d}`;
      const g = map.get(k) ?? { key: k, user_id: e.user_id, day: d, entries: [] };
      g.entries.push(e);
      map.set(k, g);
    }
    const out: Group[] = [];
    for (const g of map.values()) {
      g.entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
      if (g.day === TODAY) g.entries = g.entries.slice(0, 1); // present day: only most recent
      out.push(g);
    }
    out.sort((a, b) => (a.day === b.day ? 0 : a.day < b.day ? 1 : -1));
    return out;
  }, [filtered]);

  const maxCols = Math.max(1, ...groups.map((g) => g.entries.length));

  function exportCsv() {
    const header = [
      "#",
      "Name",
      "Date",
      ...Array.from({ length: maxCols }, (_, i) => `Entry ${i + 1}`),
    ];
    const rows = [
      header,
      ...groups.map((g, i) => {
        const author = profiles.find((p) => p.id === g.user_id);
        const name = author?.name ?? author?.email ?? "";
        const cells = Array.from({ length: maxCols }, (_, idx) => {
          const e = g.entries[idx];
          if (!e) return "";
          const proj = projects.find((p) => p.id === e.project_id)?.name ?? "";
          return `[${TYPE_LABEL[e.entry_type]}] ${e.content}${proj ? ` (${proj})` : ""} @ ${fmtTime(e.created_at)}`.replace(
            /"/g,
            '""',
          );
        });
        return [String(i + 1), name, fmtDateOnly(g.day + "T00:00:00"), ...cells];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `worklog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (!canPost && role !== "contributor") {
    return (
      <Card>
        <EmptyState title="Restricted" />
      </Card>
    );
  }

  return (
    <div>
      {/* Post form */}
      {canPost && (
        <Card className="mb-6">
          <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2">
            What are you working on?
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="e.g. Reviewing Playground content for Agent Mode project…"
            className="min-h-[90px]"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="!w-auto !h-8 !text-xs"
              >
                <option value="">— Project (optional) —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji_icon ?? "📁"} {p.name}
                  </option>
                ))}
              </Select>
              <Select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as EntryType)}
                className="!w-auto !h-8 !text-xs"
              >
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-mono text-xs ${content.length > 480 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {content.length}/500
              </span>
              <Button onClick={post} disabled={!content.trim()}>
                <Send className="h-3.5 w-3.5" /> Post Update
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content…"
              className="w-56 pl-8"
            />
          </div>
          <Select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="!w-auto !h-9 !text-xs"
          >
            <option value="">All people</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="!w-auto !h-9 !text-xs"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="!w-auto !h-9 !text-xs"
          >
            <option value="all">All categories</option>
            {TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateMode}
            onChange={(e) => {
              setDateMode(e.target.value as any);
              setDateValue("");
            }}
            className="!w-auto !h-9 !text-xs"
          >
            <option value="all">All dates</option>
            <option value="day">By day</option>
            <option value="month">By month</option>
          </Select>
          {dateMode === "day" && (
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="!h-9 !text-xs !w-auto"
            />
          )}
          {dateMode === "month" && (
            <Input
              type="month"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="!h-9 !text-xs !w-auto"
            />
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="No work log entries"
            subtitle="Post your first update above."
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                  <th className="text-left px-4 py-3 w-12">#</th>
                  <th className="text-left px-3 py-3">Name</th>
                  <th className="text-left px-3 py-3 whitespace-nowrap">Date</th>
                  {Array.from({ length: maxCols }, (_, i) => (
                    <th key={i} className="text-left px-3 py-3 min-w-[260px]">
                      Entry {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groups.map((g, i) => {
                  const author = profiles.find((p) => p.id === g.user_id);
                  return (
                    <tr key={g.key} className="hover:bg-accent/30 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {author?.photo_url ? (
                            <img src={author.photo_url} alt="" className="h-7 w-7 rounded-full" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                              {(author?.name ?? author?.email ?? "?")[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-foreground whitespace-nowrap">
                            {author?.name ?? author?.email ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {fmtDateOnly(g.day + "T00:00:00")}
                        {g.day === TODAY && (
                          <div className="text-[10px] text-primary mt-0.5">Today · latest only</div>
                        )}
                      </td>
                      {Array.from({ length: maxCols }, (_, idx) => {
                        const e = g.entries[idx];
                        if (!e)
                          return (
                            <td key={idx} className="px-3 py-3 text-xs text-muted-foreground">
                              —
                            </td>
                          );
                        const proj = projects.find((p) => p.id === e.project_id);
                        const editable = isAdmin || e.user_id === user?.id;
                        const editing = editId === e.id;
                        return (
                          <td key={idx} className="px-3 py-3 min-w-[260px] max-w-[360px]">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              {editing ? (
                                <Select
                                  value={editType}
                                  onChange={(ev) => setEditType(ev.target.value as EntryType)}
                                  className="!h-7 !text-xs"
                                >
                                  {TYPES.map((t) => (
                                    <option key={t.key} value={t.key}>
                                      {t.label}
                                    </option>
                                  ))}
                                </Select>
                              ) : (
                                <Badge tone={TYPE_TONE[e.entry_type]}>
                                  {TYPE_LABEL[e.entry_type]}
                                </Badge>
                              )}
                              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                                {fmtTime(e.created_at)}
                              </span>
                            </div>
                            {editing ? (
                              <Textarea
                                value={editContent}
                                onChange={(ev) => setEditContent(ev.target.value)}
                                className="min-h-[60px]"
                              />
                            ) : (
                              <div className="whitespace-pre-wrap text-foreground text-sm">
                                {e.content}
                              </div>
                            )}
                            <div className="mt-1.5 flex items-center justify-between gap-2">
                              {proj ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                                  {proj.emoji_icon ?? "📁"} {proj.name}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">—</span>
                              )}
                              {editable &&
                                (editing ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => saveEdit(e.id)}
                                      className="p-1 text-emerald-600 hover:text-emerald-700"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditId(null)}
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEdit(e)}
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => remove(e.id)}
                                      className="p-1 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/worklog")({ component: WorkLogPage });
