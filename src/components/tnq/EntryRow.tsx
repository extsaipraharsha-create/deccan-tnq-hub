import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, MessageSquare, Zap, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge, Select, Input } from "@/components/tnq/ui";
import { MentionTextarea } from "@/components/tnq/MentionTextarea";
import type { EntryType } from "@/lib/tnq/worklog-completion";

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

const PRIORITY_TEXT_COLOR: Record<Priority, string> = {
  P0: "text-destructive",
  P1: "text-amber-600 dark:text-amber-400",
  P2: "text-muted-foreground",
  P3: "text-sky-600 dark:text-sky-400",
};

// "2h ago" with the exact timestamp on hover — always computed from the
// viewer's local time (JS Date getters are local by default), matching
// dayKey()'s existing local-time convention so an entry near midnight never
// disagrees with which day it's grouped under.
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}
function exactTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function EntryRow({
  entry,
  author,
  showAuthor,
  project,
  isOwn,
  canModerate,
  canComment,
  commentCount,
  hideCategory,
  editing,
  editContent,
  editType,
  editPriority,
  editDeadline,
  editReviewerId,
  activeProfiles,
  onChangeEditContent,
  onChangeEditType,
  onChangeEditPriority,
  onChangeEditDeadline,
  onChangeEditReviewerId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
  onNudge,
  onToggleComments,
  commentsOpen,
  commentsPanel,
  hasDelayLogs,
  reasonOpen,
  onToggleReason,
  reasonPanel,
  selectable,
  selected,
  onToggleSelect,
  focused,
}: {
  entry: Entry;
  author?: Profile;
  /** Show a small avatar+name at the top of the row - for views that
   * interleave multiple people (Feed); omitted where a group header
   * already names the person (Person view). */
  showAuthor?: boolean;
  project?: Project;
  isOwn: boolean;
  canModerate: boolean;
  canComment: boolean;
  commentCount: number;
  /** Omit the status/category chip when the surrounding column or group
   * header already communicates it (e.g. a board column). */
  hideCategory?: boolean;
  editing: boolean;
  editContent: string;
  editType: EntryType;
  editPriority: Priority;
  editDeadline: string;
  editReviewerId: string;
  activeProfiles: Profile[];
  onChangeEditContent: (v: string) => void;
  onChangeEditType: (v: EntryType) => void;
  onChangeEditPriority: (v: Priority) => void;
  onChangeEditDeadline: (v: string) => void;
  onChangeEditReviewerId: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onNudge?: () => void;
  onToggleComments: () => void;
  commentsOpen: boolean;
  commentsPanel?: React.ReactNode;
  hasDelayLogs: boolean;
  reasonOpen: boolean;
  onToggleReason: () => void;
  reasonPanel?: React.ReactNode;
  /** Bulk-selection checkbox - only rendered when the viewer is allowed to
   * act on this entry (their own, or any entry for an admin). */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** Keyboard-navigation focus ring (J/K move this between rows; D toggles
   * complete on whichever one is focused). */
  focused?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const isCompleted = entry.entry_type === "completed";

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [entry.content, expanded]);

  if (editing) {
    return (
      <div className="px-4 py-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={editType}
            onChange={(e) => onChangeEditType(e.target.value as EntryType)}
            className="h-7! text-xs! w-auto!"
          >
            {(
              [
                "working_on",
                "need_help",
                "completed",
                "blocked",
                "review_needed",
                "available_to_help",
              ] as EntryType[]
            ).map((t) => (
              <option key={t} value={t}>
                {t
                  .split("_")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </Select>
          <Select
            value={editPriority}
            onChange={(e) => onChangeEditPriority(e.target.value as Priority)}
            className="h-7! text-xs! w-auto!"
          >
            {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input
            type="datetime-local"
            value={editDeadline}
            onChange={(e) => onChangeEditDeadline(e.target.value)}
            className="h-7! text-xs! w-auto!"
          />
          {editType === "review_needed" && entry.entry_type !== "review_needed" && (
            <Select
              value={editReviewerId}
              onChange={(e) => onChangeEditReviewerId(e.target.value)}
              className="h-7! text-xs! w-auto!"
            >
              <option value="">— Reviewer (required) —</option>
              {activeProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.email}
                </option>
              ))}
            </Select>
          )}
          <div className="flex gap-1 ml-auto">
            <button
              onClick={onSaveEdit}
              className="p-1 text-emerald-600 hover:text-emerald-700"
              aria-label="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Cancel"
            >
              ✕
            </button>
          </div>
        </div>
        <MentionTextarea
          value={editContent}
          onChange={onChangeEditContent}
          people={activeProfiles}
          minHeight="min-h-15"
        />
      </div>
    );
  }

  return (
    <div
      className={`row-actions-group px-4 py-3 ${
        focused ? "ring-2 ring-primary/50 ring-inset" : ""
      }`}
      data-entry-row={entry.id}
    >
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            aria-label="Select entry"
            className="mt-1.5 shrink-0 h-3.5 w-3.5 accent-primary"
          />
        )}
        {/* One-tap completion circle */}
        <button
          onClick={onToggleComplete}
          aria-label={isCompleted ? "Mark not complete" : "Mark complete"}
          aria-pressed={isCompleted}
          className={`mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500"
              : "border-border hover:border-emerald-500"
          }`}
        >
          {isCompleted && (
            <motion.span
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </motion.span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {showAuthor && (
            <div className="mb-1 flex items-center gap-1.5">
              {author?.photo_url ? (
                <img src={author.photo_url} alt="" className="h-5 w-5 rounded-full" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                  {(author?.name ?? author?.email ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-foreground">
                {author?.name ?? author?.email ?? "—"}
              </span>
            </div>
          )}
          {/* Line 1: content, clamped */}
          <div
            ref={textRef}
            className={`text-sm whitespace-pre-wrap break-words ${
              expanded ? "" : "line-clamp-2"
            } ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}
          >
            {entry.content}
          </div>
          {overflowing && (
            <button
              onClick={() => setExpanded((s) => !s)}
              className="mt-0.5 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? "less" : "more"}
            </button>
          )}

          {/* Line 2: one metadata line */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            {!hideCategory && (
              <Badge
                tone={
                  entry.entry_type === "blocked"
                    ? "danger"
                    : entry.entry_type === "need_help"
                      ? "warn"
                      : entry.entry_type === "completed" || entry.entry_type === "available_to_help"
                        ? "success"
                        : "default"
                }
              >
                {entry.entry_type
                  .split("_")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ")}
              </Badge>
            )}
            <span
              className={`font-mono font-semibold ${PRIORITY_TEXT_COLOR[entry.priority || "P2"]}`}
            >
              {entry.priority || "P2"}
            </span>
            {project && (
              <span className="inline-flex items-center gap-1">
                {project.emoji_icon ?? "📁"} {project.name}
              </span>
            )}
            <span title={exactTime(entry.created_at)}>{relativeTime(entry.created_at)}</span>
            {commentCount > 0 && (
              <button
                onClick={onToggleComments}
                className={`inline-flex items-center gap-0.5 ${commentsOpen ? "text-primary" : "hover:text-foreground"}`}
              >
                <MessageSquare className="h-3 w-3" />
                {commentCount}
              </button>
            )}
            {commentCount === 0 && canComment && (
              <button onClick={onToggleComments} className="hover:text-foreground">
                <MessageSquare className="h-3 w-3" />
              </button>
            )}
            {onNudge && (
              <button onClick={onNudge} title="Nudge" className="hover:text-primary">
                <Zap className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Optional 3rd line — only when there's something to say: a
              deadline/overdue state, or a reschedule history to view. Not
              part of the base 2-line design, but these are existing
              features (due-date visibility, delay reasons) that shouldn't
              quietly disappear just because they didn't make the metadata
              line's own 5-item list. */}
          {(entry.deadline && !isCompleted) || entry.deadline_updated_at || hasDelayLogs ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {entry.deadline && !isCompleted && (
                <Badge tone={isOverdue(entry.deadline) ? "danger" : "default"}>
                  Due {fmtDeadline(entry.deadline)}
                </Badge>
              )}
              {entry.deadline_updated_at && <Badge tone="warn">Deadline changed</Badge>}
              {hasDelayLogs && (
                <button
                  onClick={onToggleReason}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  {reasonOpen ? "Hide reason" : "View reason"}
                </button>
              )}
            </div>
          ) : null}
          {reasonOpen && reasonPanel}
          {commentsOpen && commentsPanel}
        </div>

        {/* Overflow menu — a real Radix trigger, so it's reachable by
            keyboard (Tab + Enter/Space) and by tap on touch regardless of
            the CSS-driven hover visibility below. */}
        {(isOwn || canModerate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="row-actions shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent focus:opacity-100"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwn && (
                <DropdownMenuItem onClick={onStartEdit}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
