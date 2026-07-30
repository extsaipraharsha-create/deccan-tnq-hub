/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Card, Button, Textarea, Select, Input, Badge, EmptyState } from "@/components/tnq/ui";
import { MessageSquare, Send, Pencil, Trash2, Download, Check, X, Search, Users, List } from "lucide-react";
import { toast } from "sonner";

type EntryType = "working_on" | "need_help" | "completed" | "blocked" | "review_needed";
type Priority = "P0" | "P1" | "P2" | "P3";
type Entry = {
  id: string;
  user_id: string;
  content: string;
  project_id: string | null;
  entry_type: EntryType;
  priority: Priority;
  deadline: string | null;
  created_at: string;
};
type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type Project = { id: string; name: string; emoji_icon: string | null };
type TaskDraft = {
  content: string;
  projectId: string;
  entryType: EntryType;
  priority: Priority;
  deadline: string;
};
function blankTask(): TaskDraft {
  return { content: "", projectId: "", entryType: "working_on", priority: "P2", deadline: "" };
}

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

const PRIORITY_LIST = [
  { key: "P0" as const, label: "P0-Critical" },
  { key: "P1" as const, label: "P1-High" },
  { key: "P2" as const, label: "P2-Medium" },
  { key: "P3" as const, label: "P3-Low" },
];
const PRIORITY_TONE: Record<string, "danger" | "warn" | "default" | "info"> = {
  P0: "danger",
  P1: "warn",
  P2: "default",
  P3: "info",
};

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
const TODAY = dayKey(new Date().toISOString());

function fmtDeadline(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
function isOverdue(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function WorkLogPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "super_admin";
  const canPost = role === "super_admin" || role === "tnq_team";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskDraft[]>([blankTask()]);

  const [filterType, setFilterType] = useState<"all" | EntryType>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dateMode, setDateMode] = useState<"all" | "day" | "month">("all");
  const [dateValue, setDateValue] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<EntryType>("working_on");
  const [editPriority, setEditPriority] = useState<Priority>("P2");
  const [editDeadline, setEditDeadline] = useState<string>("");

  const [groupByPerson, setGroupByPerson] = useState(false);

  async function load() {
    const [{ data: e }, { data: p }, { data: pr }] = await Promise.all([
      supabase.from("work_log_entries").select("*").order("created_at", { ascending: false }),
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

  // Realtime subscription
  useEffect(() => {
    const ch = supabase
      .channel("worklog-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_log_entries" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setEntries((prev) => [payload.new as Entry, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setEntries((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as Entry) : e)),
            );
          }
          if (payload.eventType === "DELETE") {
            setEntries((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  function updateTask(index: number, patch: Partial<TaskDraft>) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }
  function addTask() {
    setTasks((prev) => [...prev, blankTask()]);
  }
  function removeTask(index: number) {
    setTasks((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  // Only rows with content typed in count toward validation/posting.
  const activeTasks = tasks.filter((t) => t.content.trim().length > 0);
  const tasksReady =
    activeTasks.length > 0 && activeTasks.every((t) => t.content.trim().length <= 500 && t.deadline);

  async function postAll() {
    if (!tasksReady) return;
    const { error } = await supabase
      .from("work_log_entries")
      // Keep runtime identical; avoid Supabase generic typing inferring `never`.
      .insert(
        activeTasks.map((t) => ({
          user_id: user!.id,
          content: t.content.trim(),
          project_id: t.projectId || null,
          entry_type: t.entryType,
          priority: t.priority,
          deadline: new Date(t.deadline).toISOString(),
        })) as any,
      );
    if (error) return toast.error(error.message);
    for (const t of activeTasks) {
      await supabase.from("activity_log").insert({
        user_id: user?.id ?? "",
        action: "worklog_post",
        action_type: "work_log",
        details: { type: t.entryType },
      } as any);
    }
    setTasks([blankTask()]);
    toast.success(activeTasks.length > 1 ? `Posted ${activeTasks.length} updates` : "Posted");
  }

  function startEdit(e: Entry) {
    setEditId(e.id);
    setEditContent(e.content);
    setEditType(e.entry_type);
    setEditPriority(e.priority || "P2");
    setEditDeadline(e.deadline ? toDatetimeLocal(e.deadline) : "");
  }
  async function saveEdit(id: string) {
    const { error } = await supabase
      .from("work_log_entries")
      .update({
        content: editContent,
        entry_type: editType,
        priority: editPriority,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
      } as any)
      .eq("id", id);
    if (error) return toast.error(error.message);
    setEditId(null);
    toast.success("Updated");
  }
  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("work_log_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  }

  // Step 1: filter entries
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterType !== "all" && e.entry_type !== filterType) return false;
      if (filterPriority !== "all" && e.priority !== filterPriority) return false;
      if (filterUser && e.user_id !== filterUser) return false;
      if (filterProject && e.project_id !== filterProject) return false;
      if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateMode === "day" && dateValue && dayKey(e.created_at) !== dateValue) return false;
      if (dateMode === "month" && dateValue) {
        const mk = `${dateValue}-01`.slice(0, 7);
        const ek = e.created_at.slice(0, 7);
        if (mk !== ek) return false;
      }
      return true;
    });
  }, [entries, filterType, filterPriority, filterUser, filterProject, search, dateMode, dateValue]);

  // Step 2: group by (user_id + day). Every entry for the day is kept, newest first.
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
      out.push(g);
    }
    out.sort((a, b) => (a.day === b.day ? 0 : a.day < b.day ? 1 : -1));
    return out;
  }, [filtered]);

  const maxCols = Math.max(1, ...groups.map((g) => g.entries.length));

  // Person-grouped view data
  const personGroups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      const arr = map.get(e.user_id) ?? [];
      arr.push(e);
      map.set(e.user_id, arr);
    }
    const out: { user_id: string; entries: Entry[] }[] = [];
    for (const [user_id, entries] of map) {
      entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
      out.push({ user_id, entries });
    }
    // sort by most recent entry
    out.sort((a, b) => b.entries[0].created_at.localeCompare(a.entries[0].created_at));
    return out;
  }, [filtered]);

  function exportCsv() {
    const header = [
      "#",
      "Name",
      "Date",
      "Priority",
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
          return `[${e.priority}] [${TYPE_LABEL[e.entry_type]}] ${e.content}${proj ? ` (${proj})` : ""} @ ${fmtTime(e.created_at)}`.replace(
            /"/g,
            '""',
          );
        });
        return [
          String(i + 1),
          name,
          fmtDateOnly(g.day + "T00:00:00"),
          g.entries[0]?.priority ?? "P2",
          ...cells,
        ];
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
          <p className="text-xs text-muted-foreground mb-3">
            Multiple things to report? Add a row for each one below — each becomes its own entry
            with its own project, status, and deadline. Deadline is required for every task.
          </p>
          <div className="space-y-3">
            {tasks.map((t, i) => {
              const missingDeadline = t.content.trim().length > 0 && !t.deadline;
              return (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                      Task {i + 1}
                    </span>
                    {tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(i)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <Textarea
                    value={t.content}
                    onChange={(e) => updateTask(i, { content: e.target.value.slice(0, 500) })}
                    placeholder="e.g. Reviewing Playground content for Agent Mode project…"
                    className="min-h-15"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Select
                      value={t.projectId}
                      onChange={(e) => updateTask(i, { projectId: e.target.value })}
                      className="w-auto! h-8! text-xs!"
                    >
                      <option value="">— Project (optional) —</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji_icon ?? "📁"} {p.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={t.entryType}
                      onChange={(e) => updateTask(i, { entryType: e.target.value as EntryType })}
                      className="w-auto! h-8! text-xs!"
                    >
                      {TYPES.map((ty) => (
                        <option key={ty.key} value={ty.key}>
                          {ty.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={t.priority}
                      onChange={(e) => updateTask(i, { priority: e.target.value as Priority })}
                      className="w-auto! h-8! text-xs!"
                    >
                      {PRIORITY_LIST.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="datetime-local"
                      value={t.deadline}
                      onChange={(e) => updateTask(i, { deadline: e.target.value })}
                      title="Deadline for this task (required)"
                      className={`w-auto! h-8! text-xs! ${missingDeadline ? "border-destructive!" : ""}`}
                    />
                    <span className="font-mono text-[11px] text-muted-foreground ml-auto">
                      {t.content.length}/500
                    </span>
                  </div>
                  {missingDeadline && (
                    <div className="mt-1.5 text-xs text-destructive">
                      Deadline required before this task can be posted.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Button variant="secondary" size="sm" onClick={addTask}>
              + Add another task
            </Button>
            <Button onClick={postAll} disabled={!tasksReady}>
              <Send className="h-3.5 w-3.5" />
              {activeTasks.length > 1 ? `Post All (${activeTasks.length})` : "Post Update"}
            </Button>
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
            className="w-auto! h-9! text-xs!"
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
            className="w-auto! h-9! text-xs!"
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
            className="w-auto! h-9! text-xs!"
          >
            <option value="all">All categories</option>
            {TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="w-auto! h-9! text-xs!"
          >
            <option value="all">All PRIORITY_LIST</option>
            {PRIORITY_LIST.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateMode}
            onChange={(e) => {
              setDateMode(e.target.value as any);
              setDateValue("");
            }}
            className="w-auto! h-9! text-xs!"
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
              className="h-9! text-xs! w-auto!"
            />
          )}
          {dateMode === "month" && (
            <Input
              type="month"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="h-9! text-xs! w-auto!"
            />
          )}
          {/* Grouping toggle */}
          <button
            onClick={() => setGroupByPerson((s) => !s)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border transition-colors ${
              groupByPerson
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {groupByPerson ? (
              <>
                <Users className="h-3.5 w-3.5" /> Grouped by Person
              </>
            ) : (
              <>
                <List className="h-3.5 w-3.5" /> Chronological
              </>
            )}
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="No work log entries"
            subtitle="Post your first update above."
          />
        </Card>
      ) : groupByPerson ? (
        /* ========== GROUPED BY PERSON VIEW ========== */
        <div className="space-y-4">
          {personGroups.map((pg) => {
            const author = profiles.find((p) => p.id === pg.user_id);
            return (
              <Card key={pg.user_id} className="p-0! overflow-hidden">
                {/* Person header */}
                <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center gap-3">
                  {author?.photo_url ? (
                    <img src={author.photo_url} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {(author?.name ?? author?.email ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {author?.name ?? author?.email ?? "—"}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {pg.entries.length} update{pg.entries.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                {/* Entries */}
                <div className="divide-y divide-border">
                  {pg.entries.map((e) => {
                    const proj = projects.find((p) => p.id === e.project_id);
                    const editable = isAdmin || e.user_id === user?.id;
                    const editing = editId === e.id;
                    return (
                      <div
                        key={e.id}
                        className={`px-5 py-4 ${e.priority === "P0" ? "border-l-4 border-l-red-500" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {editing ? (
                              <>
                                <Select
                                  value={editType}
                                  onChange={(ev) => setEditType(ev.target.value as EntryType)}
                                  className="h-7! text-xs! w-auto!"
                                >
                                  {TYPES.map((t) => (
                                    <option key={t.key} value={t.key}>
                                      {t.label}
                                    </option>
                                  ))}
                                </Select>
                                <Select
                                  value={editPriority}
                                  onChange={(ev) => setEditPriority(ev.target.value as Priority)}
                                  className="h-7! text-xs! w-auto!"
                                >
                                  {PRIORITY_LIST.map((p) => (
                                    <option key={p.key} value={p.key}>
                                      {p.label}
                                    </option>
                                  ))}
                                </Select>
                                <Input
                                  type="datetime-local"
                                  value={editDeadline}
                                  onChange={(ev) => setEditDeadline(ev.target.value)}
                                  title="Deadline"
                                  className="h-7! text-xs! w-auto!"
                                />
                              </>
                            ) : (
                              <>
                                <Badge tone={TYPE_TONE[e.entry_type]}>
                                  {TYPE_LABEL[e.entry_type]}
                                </Badge>
                                <Badge tone={PRIORITY_TONE[e.priority || "P2"]}>
                                  {e.priority || "P2"}
                                </Badge>
                                {e.deadline && (
                                  <Badge tone={isOverdue(e.deadline) ? "danger" : "default"}>
                                    Due {fmtDeadline(e.deadline)}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                              {fmtTime(e.created_at)}
                            </span>
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
                        </div>
                        {editing ? (
                          <Textarea
                            value={editContent}
                            onChange={(ev) => setEditContent(ev.target.value)}
                            className="min-h-15"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-foreground text-sm">
                            {e.content}
                          </div>
                        )}
                        {proj && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                            {proj.emoji_icon ?? "📁"} {proj.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ========== CHRONOLOGICAL TABLE VIEW ========== */
        <Card className="p-0! overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                  <th className="text-left px-4 py-3 w-12">#</th>
                  <th className="text-left px-3 py-3">Name</th>
                  <th className="text-left px-3 py-3 whitespace-nowrap">Date</th>
                  <th className="text-left px-3 py-3 whitespace-nowrap">Priority</th>
                  <th className="text-left px-3 py-3">Category</th>
                  {Array.from({ length: maxCols }, (_, i) => (
                    <th key={i} className="text-left px-3 py-3 min-w-65">
                      Entry {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groups.map((g, i) => {
                  const author = profiles.find((p) => p.id === g.user_id);
                  return (
                    <tr
                      key={g.key}
                      className={`hover:bg-accent/30 align-top ${g.entries[0]?.priority === "P0" ? "border-l-4 border-l-red-500" : ""}`}
                    >
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
                      <td className="px-3 py-3">
                        <Badge tone={PRIORITY_TONE[g.entries[0]?.priority || "P2"]}>
                          {g.entries[0]?.priority || "P2"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={TYPE_TONE[g.entries[0]?.entry_type || "working_on"]}>
                          {TYPE_LABEL[g.entries[0]?.entry_type || "working_on"]}
                        </Badge>
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
                          <td key={idx} className="px-3 py-3 min-w-65 max-w-90">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                {editing ? (
                                  <>
                                    <Select
                                      value={editType}
                                      onChange={(ev) => setEditType(ev.target.value as EntryType)}
                                      className="h-7! text-xs! w-auto!"
                                    >
                                      {TYPES.map((t) => (
                                        <option key={t.key} value={t.key}>
                                          {t.label}
                                        </option>
                                      ))}
                                    </Select>
                                    <Select
                                      value={editPriority}
                                      onChange={(ev) =>
                                        setEditPriority(ev.target.value as Priority)
                                      }
                                      className="h-7! text-xs! w-auto!"
                                    >
                                      {PRIORITY_LIST.map((p) => (
                                        <option key={p.key} value={p.key}>
                                          {p.label}
                                        </option>
                                      ))}
                                    </Select>
                                    <Input
                                      type="datetime-local"
                                      value={editDeadline}
                                      onChange={(ev) => setEditDeadline(ev.target.value)}
                                      title="Deadline"
                                      className="h-7! text-xs! w-auto!"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Badge tone={TYPE_TONE[e.entry_type]}>
                                      {TYPE_LABEL[e.entry_type]}
                                    </Badge>
                                    <Badge tone={PRIORITY_TONE[e.priority || "P2"]}>
                                      {e.priority || "P2"}
                                    </Badge>
                                  </>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                                {fmtTime(e.created_at)}
                              </span>
                            </div>
                            {editing ? (
                              <Textarea
                                value={editContent}
                                onChange={(ev) => setEditContent(ev.target.value)}
                                className="min-h-15"
                              />
                            ) : (
                              <div className="whitespace-pre-wrap text-foreground text-sm">
                                {e.content}
                              </div>
                            )}
                            {e.deadline && !editing && (
                              <div className="mt-1">
                                <Badge tone={isOverdue(e.deadline) ? "danger" : "default"}>
                                  Due {fmtDeadline(e.deadline)}
                                </Badge>
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
