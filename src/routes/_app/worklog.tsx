/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { enablePushReminders, isPushSupported } from "@/lib/tnq/push";
import { undoableAction } from "@/lib/tnq/confirm-toast";
import { MentionTextarea } from "@/components/tnq/MentionTextarea";
import { WorklogReport } from "@/components/tnq/WorklogReport";
import { NeedsReviewWidget } from "@/components/tnq/NeedsReviewWidget";
import { Card, Button, Textarea, Select, Input, Badge, EmptyState, Modal } from "@/components/tnq/ui";
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  Download,
  Check,
  X,
  Search,
  Users,
  List,
  LayoutGrid,
  CheckCircle2,
  Bell,
  ChevronDown,
  Zap,
  FileBarChart,
} from "lucide-react";
import { toast } from "sonner";

type EntryType =
  | "working_on"
  | "need_help"
  | "completed"
  | "blocked"
  | "review_needed"
  | "available_to_help";
type Priority = "P0" | "P1" | "P2" | "P3";
type Entry = {
  id: string;
  user_id: string;
  content: string;
  project_id: string | null;
  entry_type: EntryType;
  priority: Priority;
  deadline: string | null;
  completed_at: string | null;
  deadline_updated_at: string | null;
  created_at: string;
};
type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type Project = { id: string; name: string; emoji_icon: string | null };
type Comment = { id: string; entry_id: string; author_id: string; body: string; created_at: string };
type DelayLog = {
  id: string;
  entry_id: string;
  old_deadline: string;
  new_deadline: string;
  reason: string;
  explanation: string | null;
  created_at: string;
};
type TaskDraft = {
  content: string;
  projectId: string;
  entryType: EntryType;
  priority: Priority;
  deadline: string;
  reviewerId: string;
};
function blankTask(): TaskDraft {
  return {
    content: "",
    projectId: "",
    entryType: "working_on",
    priority: "P2",
    deadline: "",
    reviewerId: "",
  };
}

// A "batch" is every entry posted in the same click of Post/Post All — they
// share the exact same created_at (Postgres evaluates `now()` once per
// insert statement), so entries from one sitting stay together as one card,
// while a later post (even seconds after) becomes its own new batch/card.
type Batch = { key: string; user_id: string; created_at: string; items: Entry[] };
function groupIntoBatches(entries: Entry[]): Batch[] {
  const map = new Map<string, Batch>();
  for (const e of entries) {
    const k = `${e.user_id}|${e.created_at}`;
    const b = map.get(k) ?? { key: k, user_id: e.user_id, created_at: e.created_at, items: [] };
    b.items.push(e);
    map.set(k, b);
  }
  return Array.from(map.values());
}

// A batch's "recency" is the most recent of: when it was posted, or when any
// item in it had its deadline changed. Used to sort/bucket Worklog so a
// rescheduled task surfaces as recent instead of staying buried under its
// original post date.
function batchRecency(b: Batch): string {
  return b.items.reduce(
    (max, e) => (e.deadline_updated_at && e.deadline_updated_at > max ? e.deadline_updated_at : max),
    b.created_at,
  );
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
  { key: "available_to_help", label: "Available to Help", tone: "success" },
];
const TYPE_LABEL: Record<EntryType, string> = Object.fromEntries(
  TYPES.map((t) => [t.key, t.label]),
) as any;
const TYPE_TONE: Record<EntryType, any> = Object.fromEntries(
  TYPES.map((t) => [t.key, t.tone]),
) as any;

// Board view column order (per spec — deliberately different from the
// TYPES array order above, which drives the post-form dropdown instead).
const BOARD_ORDER: EntryType[] = [
  "blocked",
  "need_help",
  "working_on",
  "review_needed",
  "completed",
  "available_to_help",
];

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

function ReasonPanel({ logs }: { logs: DelayLog[] }) {
  if (logs.length === 0) return null;
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/30 p-2.5">
      {logs.map((l) => (
        <div key={l.id} className="text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-foreground uppercase">
              {l.reason}
            </span>
            <span className="text-muted-foreground">
              — was due {fmtDeadline(l.old_deadline)}, moved to {fmtDeadline(l.new_deadline)}
            </span>
          </div>
          {l.explanation && <div className="mt-1 text-foreground">{l.explanation}</div>}
        </div>
      ))}
    </div>
  );
}

function CommentPanel({
  comments,
  profiles,
  currentUserId,
  isAdmin,
  canComment,
  onAdd,
  onDelete,
}: {
  comments: Comment[];
  profiles: Profile[];
  currentUserId: string | undefined;
  isAdmin: boolean;
  canComment: boolean;
  onAdd: (body: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const who = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p?.name ?? p?.email ?? "—";
  };
  async function submit() {
    if (!text.trim() || posting) return;
    setPosting(true);
    await onAdd(text.trim());
    setText("");
    setPosting(false);
  }
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/30 p-2.5">
      {comments.length === 0 ? (
        <div className="text-xs text-muted-foreground">No comments yet.</div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{who(c.author_id)}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {fmtTime(c.created_at)}
                </span>
                {(c.author_id === currentUserId || isAdmin) && (
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-0.5 text-foreground whitespace-pre-wrap">{c.body}</div>
          </div>
        ))
      )}
      {canComment && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Add a comment…"
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={submit} disabled={posting || !text.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}

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
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [delayLogs, setDelayLogs] = useState<DelayLog[]>([]);
  const [openReasonId, setOpenReasonId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskDraft[]>([blankTask()]);

  // Restore the last-used filter combo (per-user, via localStorage) on
  // first render, computed once so it doesn't refetch on every render.
  const savedFilters = useState(() => {
    try {
      const raw = user ? localStorage.getItem(`tnq_worklog_filters_${user.id}`) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })[0];

  const [filterType, setFilterType] = useState<"all" | EntryType>(savedFilters.filterType ?? "all");
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>(
    savedFilters.filterPriority ?? "all",
  );
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>(savedFilters.filterProject ?? "");
  const [search, setSearch] = useState("");
  const [dateMode, setDateMode] = useState<"all" | "day" | "month">("all");
  const [dateValue, setDateValue] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<EntryType>("working_on");
  const [editPriority, setEditPriority] = useState<Priority>("P2");
  const [editDeadline, setEditDeadline] = useState<string>("");
  const [editReviewerId, setEditReviewerId] = useState<string>("");

  const [viewMode, setViewMode] = useState<"feed" | "board" | "person" | "team">(
    savedFilters.viewMode ?? "feed",
  );
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);

  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterProjectFilter, setRosterProjectFilter] = useState("");
  const [expandedRosterId, setExpandedRosterId] = useState<string | null>(null);
  const [reportUserId, setReportUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(
        `tnq_worklog_filters_${user.id}`,
        JSON.stringify({ filterType, filterPriority, filterProject, viewMode }),
      );
    } catch {
      // Storage can be unavailable (private mode, quota) — filters just
      // won't persist that session, nothing else depends on this.
    }
  }, [user, filterType, filterPriority, filterProject, viewMode]);

  // Dashboard's "My open items" shortcut lands here as /worklog?view=board&mine=1.
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "board") setViewMode("board");
    if (params.get("mine") === "1") setFilterUser(user.id);
  }, [user]);

  const PUSH_DISMISS_KEY = "tnq_push_reminder_dismissed";
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  useEffect(() => {
    if (!canPost || !isPushSupported()) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(PUSH_DISMISS_KEY)) return;
    setShowPushPrompt(true);
  }, [canPost]);
  async function handleEnablePush() {
    if (!user) return;
    setEnablingPush(true);
    try {
      await enablePushReminders(user.id);
      toast.success("Deadline reminders enabled");
      setShowPushPrompt(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't enable push notifications");
    }
    setEnablingPush(false);
  }
  function dismissPushPrompt() {
    localStorage.setItem(PUSH_DISMISS_KEY, "1");
    setShowPushPrompt(false);
  }

  async function load() {
    const [{ data: e }, { data: p }, { data: pr }, { data: dl }, { data: cm }] = await Promise.all([
      supabase.from("work_log_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,name,email,photo_url"),
      supabase.from("projects").select("id,name,emoji_icon"),
      (supabase as any)
        .from("work_log_delay_log")
        .select("*")
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("work_log_comments")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);
    setEntries((e as any) ?? []);
    setProfiles((p as any) ?? []);
    setProjects((pr as any) ?? []);
    setDelayLogs((dl as DelayLog[]) ?? []);
    setComments((cm as Comment[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);
  // Backstop in case the realtime subscription below doesn't fire (e.g. the
  // table isn't in the DB's realtime publication) — polling + focus refetch
  // still keeps this page current.
  useAutoRefresh(load);

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

  // Realtime for comments — so a reply/new comment shows up for whoever's
  // looking at that entry without waiting on the poll.
  useEffect(() => {
    const ch = supabase
      .channel("worklog-comments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_log_comments" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [...prev, payload.new as Comment]);
          }
          if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
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
    activeTasks.length > 0 &&
    activeTasks.every(
      (t) =>
        t.content.trim().length <= 500 &&
        t.deadline &&
        (t.entryType !== "review_needed" || t.reviewerId),
    );

  async function postAll() {
    if (!tasksReady) return;
    const { data: inserted, error } = await supabase
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
      )
      .select();
    if (error) return toast.error(error.message);
    const insertedEntries = (inserted as any as Entry[]) ?? [];
    for (let i = 0; i < activeTasks.length; i++) {
      const t = activeTasks[i];
      const entry = insertedEntries[i];
      await supabase.from("activity_log").insert({
        user_id: user?.id ?? "",
        action: "worklog_post",
        action_type: "work_log",
        details: { type: t.entryType },
      } as any);
      if (t.entryType === "review_needed" && t.reviewerId && entry) {
        await requestReview(entry.id, t.reviewerId);
      }
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
    setEditReviewerId("");
  }
  async function saveEdit(id: string) {
    const original = entries.find((e) => e.id === id);
    if (editType === "review_needed" && original?.entry_type !== "review_needed" && !editReviewerId) {
      toast.error("Pick a reviewer before saving");
      return;
    }
    const newDeadline = editDeadline ? new Date(editDeadline).toISOString() : null;
    const deadlineChanged = newDeadline !== (original?.deadline ?? null);
    const { error } = await supabase
      .from("work_log_entries")
      .update({
        content: editContent,
        entry_type: editType,
        priority: editPriority,
        deadline: newDeadline,
        ...(deadlineChanged
          ? {
              deadline_updated_at: new Date().toISOString(),
              reminder_sent_at: null,
              overdue_notified_at: null,
            }
          : {}),
      } as any)
      .eq("id", id);
    if (error) return toast.error(error.message);
    if (editType === "review_needed" && original?.entry_type !== "review_needed" && editReviewerId) {
      await requestReview(id, editReviewerId);
    }
    setEditId(null);
    toast.success("Updated");
  }
  function remove(id: string) {
    setPendingDeleteIds((prev) => new Set(prev).add(id));
    undoableAction(
      "Entry deleted",
      async () => {
        const { error } = await supabase.from("work_log_entries").delete().eq("id", id);
        if (error) toast.error(error.message);
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
      () => {
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    );
  }
  async function markComplete(id: string) {
    const { error } = await supabase
      .from("work_log_entries")
      .update({ completed_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked complete");
  }
  function logsFor(entryId: string) {
    return delayLogs.filter((l) => l.entry_id === entryId);
  }
  function commentsFor(entryId: string) {
    return comments.filter((c) => c.entry_id === entryId);
  }
  async function addComment(entryId: string, body: string) {
    const { error } = await (supabase as any)
      .from("work_log_comments")
      .insert({ entry_id: entryId, author_id: user?.id, body });
    if (error) toast.error(error.message);
  }
  async function deleteComment(id: string) {
    const { error } = await (supabase as any).from("work_log_comments").delete().eq("id", id);
    if (error) toast.error(error.message);
  }
  async function requestReview(entryId: string, reviewerId: string) {
    const { error } = await (supabase as any)
      .from("work_log_review_requests")
      .insert({ entry_id: entryId, requested_by: user?.id, reviewer_id: reviewerId });
    if (error) return toast.error(error.message);
    supabase.functions
      .invoke("send-notification", {
        body: {
          user_ids: [reviewerId],
          title: "👀 Review requested",
          body: "Someone asked you to review a worklog entry.",
          url: "/worklog",
        },
      })
      .catch(() => {});
  }
  async function sendNudge(entryId: string, toUser: string) {
    const { error } = await (supabase as any)
      .from("work_log_nudges")
      .insert({ entry_id: entryId, from_user: user?.id, to_user: toUser });
    if (error) return toast.error(error.message);
    toast.success("Nudge sent");
  }

  // Step 1: filter entries
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (pendingDeleteIds.has(e.id)) return false;
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
      if (overdueOnly && !(e.deadline && !e.completed_at && isOverdue(e.deadline))) return false;
      return true;
    });
  }, [
    entries,
    pendingDeleteIds,
    filterType,
    filterPriority,
    filterUser,
    filterProject,
    search,
    dateMode,
    dateValue,
    overdueOnly,
  ]);

  // Step 2: group filtered entries into posting batches, then by (user_id + day).
  type Group = { key: string; user_id: string; day: string; entries: Batch[] };
  const groups: Group[] = useMemo(() => {
    const batches = groupIntoBatches(filtered);
    const map = new Map<string, Group>();
    for (const b of batches) {
      const d = dayKey(batchRecency(b));
      const k = `${b.user_id}|${d}`;
      const g = map.get(k) ?? { key: k, user_id: b.user_id, day: d, entries: [] };
      g.entries.push(b);
      map.set(k, g);
    }
    const out: Group[] = [];
    for (const g of map.values()) {
      g.entries.sort((a, b) => batchRecency(b).localeCompare(batchRecency(a)));
      out.push(g);
    }
    out.sort((a, b) => (a.day === b.day ? 0 : a.day < b.day ? 1 : -1));
    return out;
  }, [filtered]);

  const maxCols = Math.max(1, ...groups.map((g) => g.entries.length));

  // Person-grouped view data — one card per posting batch, newest first.
  const personGroups = useMemo(() => {
    const batches = groupIntoBatches(filtered);
    const map = new Map<string, Batch[]>();
    for (const b of batches) {
      const arr = map.get(b.user_id) ?? [];
      arr.push(b);
      map.set(b.user_id, arr);
    }
    const out: { user_id: string; batches: Batch[] }[] = [];
    for (const [user_id, bs] of map) {
      bs.sort((a, b) => batchRecency(b).localeCompare(batchRecency(a)));
      out.push({ user_id, batches: bs });
    }
    // sort by most recent batch
    out.sort((a, b) => batchRecency(b.batches[0]).localeCompare(batchRecency(a.batches[0])));
    return out;
  }, [filtered]);

  // Board view: flat entries (no batching) grouped into columns by status.
  const boardColumns = useMemo(() => {
    const map = new Map<EntryType, Entry[]>();
    for (const t of BOARD_ORDER) map.set(t, []);
    for (const e of filtered) {
      map.get(e.entry_type)?.push(e);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return map;
  }, [filtered]);

  // Team Roster: every worklog author except the viewer themself — generic
  // by "has entries", not filtered by role, so it keeps working unchanged
  // once contributor accounts exist. Built from the already-fetched
  // `entries` (not the entry-level `filtered`), since the roster has its
  // own search/project filter below.
  type RosterPerson = {
    userId: string;
    entries: Entry[];
    openEntries: Entry[];
    status: "blocked" | "active" | "quiet";
    blockedCount: number;
    quietDays: number;
    heatmap: { day: string; count: number }[];
  };
  const roster: RosterPerson[] = useMemo(() => {
    const byUser = new Map<string, Entry[]>();
    for (const e of entries) {
      if (e.user_id === user?.id) continue;
      const arr = byUser.get(e.user_id) ?? [];
      arr.push(e);
      byUser.set(e.user_id, arr);
    }
    const today = new Date();
    const todayKey = dayKey(today.toISOString());
    const out: RosterPerson[] = [];
    for (const [userId, userEntries] of byUser) {
      const openEntries = userEntries.filter((e) => !e.completed_at);
      const hasBlocked = openEntries.some((e) => e.entry_type === "blocked");
      const hasToday = userEntries.some((e) => dayKey(e.created_at) === todayKey);
      const sorted = [...userEntries].sort((a, b) => b.created_at.localeCompare(a.created_at));
      const lastDate = sorted[0] ? new Date(sorted[0].created_at) : null;
      const quietDays = lastDate
        ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      const status: RosterPerson["status"] = hasBlocked ? "blocked" : hasToday ? "active" : "quiet";
      const heatmap: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dayKey(d.toISOString());
        heatmap.push({ day: key, count: userEntries.filter((e) => dayKey(e.created_at) === key).length });
      }
      out.push({
        userId,
        entries: userEntries,
        openEntries,
        status,
        blockedCount: userEntries.filter((e) => e.entry_type === "blocked").length,
        quietDays,
        heatmap,
      });
    }
    out.sort((a, b) => a.status.localeCompare(b.status));
    return out;
  }, [entries, user?.id]);

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    return roster.filter((p) => {
      if (q) {
        const prof = profiles.find((x) => x.id === p.userId);
        const name = (prof?.name ?? prof?.email ?? "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (rosterProjectFilter && !p.entries.some((e) => e.project_id === rosterProjectFilter)) {
        return false;
      }
      return true;
    });
  }, [roster, rosterSearch, rosterProjectFilter, profiles]);

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
          const b = g.entries[idx];
          if (!b) return "";
          return b.items
            .map((e) => {
              const proj = projects.find((p) => p.id === e.project_id)?.name ?? "";
              return `[${e.priority}] [${TYPE_LABEL[e.entry_type]}] ${e.content}${proj ? ` (${proj})` : ""} @ ${fmtTime(e.created_at)}`;
            })
            .join(" | ")
            .replace(/"/g, '""');
        });
        return [
          String(i + 1),
          name,
          fmtDateOnly(g.day + "T00:00:00"),
          g.entries[0]?.items[0]?.priority ?? "P2",
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
      <div className="mb-4">
        <NeedsReviewWidget />
      </div>
      {showPushPrompt && (
        <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-primary shrink-0" />
            <div className="text-sm text-foreground">
              Get a push reminder 1 hour before your task deadlines — even if the tab's closed.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={dismissPushPrompt}>
              Not now
            </Button>
            <Button size="sm" onClick={handleEnablePush} disabled={enablingPush}>
              {enablingPush ? "Enabling…" : "Enable reminders"}
            </Button>
          </div>
        </Card>
      )}
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
                  <MentionTextarea
                    value={t.content}
                    onChange={(v) => updateTask(i, { content: v.slice(0, 500) })}
                    people={profiles}
                    placeholder="e.g. Reviewing Playground content for Agent Mode project… Type @ to mention someone."
                    minHeight="min-h-15"
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
                  {t.entryType === "review_needed" && (
                    <div className="mt-2">
                      <Select
                        value={t.reviewerId}
                        onChange={(e) => updateTask(i, { reviewerId: e.target.value })}
                        className={`w-auto! h-8! text-xs! ${
                          t.content.trim() && !t.reviewerId ? "border-destructive!" : ""
                        }`}
                      >
                        <option value="">— Pick a reviewer (required) —</option>
                        {profiles
                          .filter((p) => p.id !== user?.id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name ?? p.email}
                            </option>
                          ))}
                      </Select>
                    </div>
                  )}
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
          {/* Overdue toggle */}
          <button
            onClick={() => setOverdueOnly((s) => !s)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg border transition-colors ${
              overdueOnly
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            Overdue only
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* View mode */}
      <div className="mb-4 flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit">
        {(
          [
            { key: "feed" as const, label: "Feed", icon: List },
            { key: "board" as const, label: "Board", icon: LayoutGrid },
            { key: "person" as const, label: "Grouped by Person", icon: Users },
            ...(canPost
              ? [{ key: "team" as const, label: "Team", icon: FileBarChart }]
              : []),
          ] as const
        ).map((v) => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors uppercase ${
              viewMode === v.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <v.icon className="h-3.5 w-3.5" /> {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "team" ? (
        /* ========== TEAM ROSTER VIEW ========== */
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-56 pl-8"
              />
            </div>
            <Select
              value={rosterProjectFilter}
              onChange={(e) => setRosterProjectFilter(e.target.value)}
              className="w-auto! h-9! text-xs!"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          {filteredRoster.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Users className="h-10 w-10" />}
                title="No one else here yet"
                subtitle="Once teammates post updates, they'll show up here."
              />
            </Card>
          ) : (
            <Card className="p-0! overflow-hidden">
              {filteredRoster.map((p) => {
                const prof = profiles.find((x) => x.id === p.userId);
                const expanded = expandedRosterId === p.userId;
                const statusBadge =
                  p.status === "blocked" ? (
                    <Badge tone="danger">Blocked</Badge>
                  ) : p.status === "active" ? (
                    <Badge tone="success">Active today</Badge>
                  ) : (
                    <Badge tone="default">No update today</Badge>
                  );
                return (
                  <div key={p.userId} className="border-b border-border last:border-0">
                    <button
                      onClick={() => setExpandedRosterId(expanded ? null : p.userId)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-accent/30 transition-colors"
                    >
                      {prof?.photo_url ? (
                        <img src={prof.photo_url} alt="" className="h-8 w-8 rounded-full shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {(prof?.name ?? prof?.email ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {prof?.name ?? prof?.email ?? "—"}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {p.heatmap.map((h) => (
                            <div
                              key={h.day}
                              title={`${h.day}: ${h.count} update${h.count === 1 ? "" : "s"}`}
                              className={`h-3.5 w-2 rounded-sm ${h.count > 0 ? "bg-primary" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {statusBadge}
                        {p.quietDays >= 3 && <Badge tone="warn">Quiet {p.quietDays}+ days</Badge>}
                        <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {p.openEntries.length} active
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 space-y-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setReportUserId(p.userId)}
                            >
                              <FileBarChart className="h-3.5 w-3.5" /> View report
                            </Button>
                            {p.openEntries.length === 0 ? (
                              <div className="text-xs text-muted-foreground pt-1">
                                No open entries.
                              </div>
                            ) : (
                              p.openEntries.map((e) => {
                                const proj = projects.find((x) => x.id === e.project_id);
                                const entryComments = commentsFor(e.id);
                                return (
                                  <div key={e.id} className="rounded-lg border border-border p-3">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
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
                                    </div>
                                    <div className="text-sm text-foreground whitespace-pre-wrap">
                                      {e.content}
                                    </div>
                                    {proj && (
                                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                                        {proj.emoji_icon ?? "📁"} {proj.name}
                                      </div>
                                    )}
                                    <div className="mt-2 flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          setOpenCommentId(openCommentId === e.id ? null : e.id)
                                        }
                                        className={`inline-flex items-center gap-1 p-1 text-xs ${openCommentId === e.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {entryComments.length > 0 && (
                                          <span className="font-mono text-[10px]">
                                            {entryComments.length}
                                          </span>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => sendNudge(e.id, p.userId)}
                                        title="Nudge"
                                        className="p-1 text-muted-foreground hover:text-primary"
                                      >
                                        <Zap className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    {openCommentId === e.id && (
                                      <CommentPanel
                                        comments={entryComments}
                                        profiles={profiles}
                                        currentUserId={user?.id}
                                        isAdmin={isAdmin}
                                        canComment={isAdmin || role === "tnq_team"}
                                        onAdd={(body) => addComment(e.id, body)}
                                        onDelete={deleteComment}
                                      />
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="No work log entries"
            subtitle="Post your first update above."
          />
        </Card>
      ) : viewMode === "board" ? (
        /* ========== BOARD VIEW ========== */
        <div className="flex gap-4 overflow-x-auto pb-2">
          {BOARD_ORDER.map((t) => {
            const items = boardColumns.get(t) ?? [];
            return (
              <div key={t} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <Badge tone={TYPE_TONE[t]}>{TYPE_LABEL[t]}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-20">
                  <AnimatePresence initial={false}>
                    {items.map((e, i) => {
                    const author = profiles.find((p) => p.id === e.user_id);
                    const proj = projects.find((p) => p.id === e.project_id);
                    return (
                      <motion.button
                        key={e.id}
                        layout
                        type="button"
                        onClick={() => setDetailEntry(e)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15, delay: Math.min(i, 6) * 0.02 }}
                        whileHover={{ y: -2 }}
                        className={`block w-full text-left bg-card border border-border rounded-xl p-3 shadow-soft hover:shadow-lift transition-shadow ${e.priority === "P0" ? "border-l-4 border-l-destructive" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Badge tone={PRIORITY_TONE[e.priority || "P2"]}>{e.priority || "P2"}</Badge>
                          {author?.photo_url ? (
                            <img src={author.photo_url} alt="" className="h-5 w-5 rounded-full" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                              {(author?.name ?? author?.email ?? "?")[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-foreground line-clamp-3">{e.content}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {proj && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                              {proj.emoji_icon ?? "📁"} {proj.name}
                            </span>
                          )}
                          {e.deadline &&
                            (e.completed_at ? (
                              <Badge tone="success">Done</Badge>
                            ) : (
                              <Badge tone={isOverdue(e.deadline) ? "danger" : "default"}>
                                Due {fmtDeadline(e.deadline)}
                              </Badge>
                            ))}
                        </div>
                      </motion.button>
                    );
                    })}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Nothing here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "person" ? (
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
                      {pg.batches.reduce((n, b) => n + b.items.length, 0)} update
                      {pg.batches.reduce((n, b) => n + b.items.length, 0) === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                {/* Batches (one card section per posting session) */}
                <div className="divide-y divide-border">
                  {pg.batches.map((batch) => (
                    <div key={batch.key}>
                      {batch.items.map((e, itemIdx) => {
                    const proj = projects.find((p) => p.id === e.project_id);
                    const isOwn = e.user_id === user?.id;
                    const canModerate = isAdmin;
                    const canComment = isAdmin || role === "tnq_team" || isOwn;
                    const entryComments = commentsFor(e.id);
                    const editing = editId === e.id;
                    return (
                      <div
                        key={e.id}
                        className={`px-5 py-4 ${e.priority === "P0" ? "border-l-4 border-l-red-500" : ""} ${itemIdx > 0 ? "border-t border-dashed border-border/60" : ""}`}
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
                                {editType === "review_needed" && e.entry_type !== "review_needed" && (
                                  <Select
                                    value={editReviewerId}
                                    onChange={(ev) => setEditReviewerId(ev.target.value)}
                                    className="h-7! text-xs! w-auto!"
                                  >
                                    <option value="">— Reviewer (required) —</option>
                                    {profiles
                                      .filter((pr) => pr.id !== user?.id)
                                      .map((pr) => (
                                        <option key={pr.id} value={pr.id}>
                                          {pr.name ?? pr.email}
                                        </option>
                                      ))}
                                  </Select>
                                )}
                              </>
                            ) : (
                              <>
                                <Badge tone={TYPE_TONE[e.entry_type]}>
                                  {TYPE_LABEL[e.entry_type]}
                                </Badge>
                                <Badge tone={PRIORITY_TONE[e.priority || "P2"]}>
                                  {e.priority || "P2"}
                                </Badge>
                                {e.deadline &&
                                  (e.completed_at ? (
                                    <Badge tone="success">Done</Badge>
                                  ) : (
                                    <Badge tone={isOverdue(e.deadline) ? "danger" : "default"}>
                                      Due {fmtDeadline(e.deadline)}
                                    </Badge>
                                  ))}
                                {e.deadline_updated_at && (
                                  <Badge tone="warn">Deadline changed</Badge>
                                )}
                                {logsFor(e.id).length > 0 && (
                                  <button
                                    onClick={() =>
                                      setOpenReasonId(openReasonId === e.id ? null : e.id)
                                    }
                                    className="text-[11px] font-medium text-primary hover:underline"
                                  >
                                    {openReasonId === e.id ? "Hide reason" : "View reason"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                              {fmtTime(e.created_at)}
                            </span>
                            {editing ? (
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
                                {(isOwn || canModerate) && !e.completed_at && (
                                  <button
                                    onClick={() => markComplete(e.id)}
                                    title="Mark complete"
                                    className="p-1 text-muted-foreground hover:text-emerald-600"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {(canComment || entryComments.length > 0) && (
                                  <button
                                    onClick={() =>
                                      setOpenCommentId(openCommentId === e.id ? null : e.id)
                                    }
                                    title="Comments"
                                    className={`p-1 flex items-center gap-0.5 ${openCommentId === e.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    {entryComments.length > 0 && (
                                      <span className="font-mono text-[10px]">
                                        {entryComments.length}
                                      </span>
                                    )}
                                  </button>
                                )}
                                {isOwn && (
                                  <button
                                    onClick={() => startEdit(e)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {(isOwn || canModerate) && (
                                  <button
                                    onClick={() => remove(e.id)}
                                    className="p-1 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {editing ? (
                          <MentionTextarea
                            value={editContent}
                            onChange={setEditContent}
                            people={profiles}
                            minHeight="min-h-15"
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
                        {openReasonId === e.id && <ReasonPanel logs={logsFor(e.id)} />}
                        {openCommentId === e.id && (
                          <CommentPanel
                            comments={entryComments}
                            profiles={profiles}
                            currentUserId={user?.id}
                            isAdmin={isAdmin}
                            canComment={canComment}
                            onAdd={(body) => addComment(e.id, body)}
                            onDelete={deleteComment}
                          />
                        )}
                      </div>
                    );
                      })}
                    </div>
                  ))}
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
                      className={`hover:bg-accent/30 align-top ${g.entries[0]?.items[0]?.priority === "P0" ? "border-l-4 border-l-red-500" : ""}`}
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
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={PRIORITY_TONE[g.entries[0]?.items[0]?.priority || "P2"]}>
                          {g.entries[0]?.items[0]?.priority || "P2"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={TYPE_TONE[g.entries[0]?.items[0]?.entry_type || "working_on"]}>
                          {TYPE_LABEL[g.entries[0]?.items[0]?.entry_type || "working_on"]}
                        </Badge>
                      </td>
                      {Array.from({ length: maxCols }, (_, idx) => {
                        const b = g.entries[idx];
                        if (!b)
                          return (
                            <td key={idx} className="px-3 py-3 text-xs text-muted-foreground">
                              —
                            </td>
                          );
                        return (
                          <td key={idx} className="px-3 py-3 min-w-65 max-w-90">
                            <div className="space-y-2">
                              {b.items.map((e, itemIdx) => {
                                const proj = projects.find((p) => p.id === e.project_id);
                                const isOwn = e.user_id === user?.id;
                                const canModerate = isAdmin;
                                const canComment = isAdmin || role === "tnq_team" || isOwn;
                                const entryComments = commentsFor(e.id);
                                const editing = editId === e.id;
                                return (
                                  <div
                                    key={e.id}
                                    className={
                                      itemIdx > 0
                                        ? "pt-2 border-t border-dashed border-border/60"
                                        : ""
                                    }
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-2">
                                        {editing ? (
                                          <>
                                            <Select
                                              value={editType}
                                              onChange={(ev) =>
                                                setEditType(ev.target.value as EntryType)
                                              }
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
                                            {editType === "review_needed" &&
                                              e.entry_type !== "review_needed" && (
                                                <Select
                                                  value={editReviewerId}
                                                  onChange={(ev) => setEditReviewerId(ev.target.value)}
                                                  className="h-7! text-xs! w-auto!"
                                                >
                                                  <option value="">— Reviewer (required) —</option>
                                                  {profiles
                                                    .filter((pr) => pr.id !== user?.id)
                                                    .map((pr) => (
                                                      <option key={pr.id} value={pr.id}>
                                                        {pr.name ?? pr.email}
                                                      </option>
                                                    ))}
                                                </Select>
                                              )}
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
                                      <MentionTextarea
                                        value={editContent}
                                        onChange={setEditContent}
                                        people={profiles}
                                        minHeight="min-h-15"
                                      />
                                    ) : (
                                      <div className="whitespace-pre-wrap text-foreground text-sm">
                                        {e.content}
                                      </div>
                                    )}
                                    {e.deadline && !editing && (
                                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                        {e.completed_at ? (
                                          <Badge tone="success">Done</Badge>
                                        ) : (
                                          <Badge tone={isOverdue(e.deadline) ? "danger" : "default"}>
                                            Due {fmtDeadline(e.deadline)}
                                          </Badge>
                                        )}
                                        {e.deadline_updated_at && (
                                          <Badge tone="warn">Deadline changed</Badge>
                                        )}
                                        {logsFor(e.id).length > 0 && (
                                          <button
                                            onClick={() =>
                                              setOpenReasonId(openReasonId === e.id ? null : e.id)
                                            }
                                            className="text-[11px] font-medium text-primary hover:underline"
                                          >
                                            {openReasonId === e.id ? "Hide reason" : "View reason"}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {openReasonId === e.id && <ReasonPanel logs={logsFor(e.id)} />}
                                    {openCommentId === e.id && (
                                      <CommentPanel
                                        comments={entryComments}
                                        profiles={profiles}
                                        currentUserId={user?.id}
                                        isAdmin={isAdmin}
                                        canComment={canComment}
                                        onAdd={(body) => addComment(e.id, body)}
                                        onDelete={deleteComment}
                                      />
                                    )}
                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                      {proj ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                                          {proj.emoji_icon ?? "📁"} {proj.name}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-muted-foreground">—</span>
                                      )}
                                      {editing ? (
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
                                          {(isOwn || canModerate) && !e.completed_at && (
                                            <button
                                              onClick={() => markComplete(e.id)}
                                              title="Mark complete"
                                              className="p-1 text-muted-foreground hover:text-emerald-600"
                                            >
                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                          {(canComment || entryComments.length > 0) && (
                                            <button
                                              onClick={() =>
                                                setOpenCommentId(openCommentId === e.id ? null : e.id)
                                              }
                                              title="Comments"
                                              className={`p-1 flex items-center gap-0.5 ${openCommentId === e.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                              <MessageSquare className="h-3.5 w-3.5" />
                                              {entryComments.length > 0 && (
                                                <span className="font-mono text-[10px]">
                                                  {entryComments.length}
                                                </span>
                                              )}
                                            </button>
                                          )}
                                          {isOwn && (
                                            <button
                                              onClick={() => startEdit(e)}
                                              className="p-1 text-muted-foreground hover:text-foreground"
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                          {(isOwn || canModerate) && (
                                            <button
                                              onClick={() => remove(e.id)}
                                              className="p-1 text-muted-foreground hover:text-destructive"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
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

      {/* Board-card detail modal */}
      <Modal
        open={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        title="Worklog entry"
        footer={
          detailEntry &&
          (isAdmin || detailEntry.user_id === user?.id) && (
            <>
              {!detailEntry.completed_at && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    markComplete(detailEntry.id);
                    setDetailEntry(null);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => {
                  remove(detailEntry.id);
                  setDetailEntry(null);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </>
          )
        }
      >
        {detailEntry && (
          <>
            <div className="flex items-center gap-3">
              {(() => {
                const author = profiles.find((p) => p.id === detailEntry.user_id);
                return author?.photo_url ? (
                  <img src={author.photo_url} alt="" className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {(author?.name ?? author?.email ?? "?")[0]?.toUpperCase()}
                  </div>
                );
              })()}
              <div>
                <div className="text-sm font-medium text-foreground">
                  {profiles.find((p) => p.id === detailEntry.user_id)?.name ??
                    profiles.find((p) => p.id === detailEntry.user_id)?.email ??
                    "—"}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {fmtDateOnly(detailEntry.created_at)} · {fmtTime(detailEntry.created_at)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={TYPE_TONE[detailEntry.entry_type]}>
                {TYPE_LABEL[detailEntry.entry_type]}
              </Badge>
              <Badge tone={PRIORITY_TONE[detailEntry.priority || "P2"]}>
                {detailEntry.priority || "P2"}
              </Badge>
              {detailEntry.deadline &&
                (detailEntry.completed_at ? (
                  <Badge tone="success">Done</Badge>
                ) : (
                  <Badge tone={isOverdue(detailEntry.deadline) ? "danger" : "default"}>
                    Due {fmtDeadline(detailEntry.deadline)}
                  </Badge>
                ))}
              {detailEntry.deadline_updated_at && <Badge tone="warn">Deadline changed</Badge>}
            </div>
            <div className="whitespace-pre-wrap text-sm text-foreground">{detailEntry.content}</div>
            {(() => {
              const proj = projects.find((p) => p.id === detailEntry.project_id);
              return proj ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium">
                  {proj.emoji_icon ?? "📁"} {proj.name}
                </div>
              ) : null;
            })()}
            <ReasonPanel logs={logsFor(detailEntry.id)} />
            <div>
              <div className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase mb-1.5">
                Comments
              </div>
              <CommentPanel
                comments={commentsFor(detailEntry.id)}
                profiles={profiles}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                canComment={
                  isAdmin || role === "tnq_team" || detailEntry.user_id === user?.id
                }
                onAdd={(body) => addComment(detailEntry.id, body)}
                onDelete={deleteComment}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Team Roster "View report" modal */}
      <Modal
        open={!!reportUserId}
        onClose={() => setReportUserId(null)}
        size="xl"
        title={
          reportUserId
            ? (() => {
                const p = profiles.find((x) => x.id === reportUserId);
                return `${p?.name ?? p?.email ?? "Report"}'s report`;
              })()
            : "Report"
        }
      >
        {reportUserId && <WorklogReport userId={reportUserId} />}
      </Modal>
    </div>
  );
}

export const Route = createFileRoute("/_app/worklog")({ component: WorkLogPage });
