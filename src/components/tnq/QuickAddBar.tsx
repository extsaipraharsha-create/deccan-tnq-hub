import { useMemo, useState } from "react";
import { Send, X as XIcon } from "lucide-react";
import { Badge } from "@/components/tnq/ui";

type Priority = "P0" | "P1" | "P2" | "P3";
type Project = { id: string; name: string; emoji_icon: string | null };
type Profile = { id: string; name: string | null; email: string | null };

export type QuickAddResult = {
  content: string;
  priority: Priority;
  projectId: string | null;
  reviewerId: string | null;
};

// Tries every occurrence of `trigger` (# or @) in the text, not just the
// first - "mixed #unknown-tag but #RealProject" still resolves the second
// one. At each occurrence, tries each candidate's full display name as a
// case-insensitive match right after it, longest name first (so "Atlas"
// doesn't shadow "Atlas ML"). The match must end at a word boundary (end of
// string, whitespace, or the next trigger), so "#Atlas MLx" doesn't
// false-match "Atlas ML". No match anywhere -> left as literal text,
// exactly as typed.
function resolveToken<T>(
  text: string,
  trigger: "#" | "@",
  candidates: { label: string; item: T }[],
): { text: string; resolved: T | null } {
  const sorted = [...candidates].sort((a, b) => b.label.length - a.label.length);
  let searchFrom = 0;
  for (;;) {
    const idx = text.indexOf(trigger, searchFrom);
    if (idx === -1) return { text, resolved: null };
    const after = text.slice(idx + 1);
    for (const c of sorted) {
      if (!c.label) continue;
      const n = c.label.length;
      if (after.slice(0, n).toLowerCase() !== c.label.toLowerCase()) continue;
      const charAfter = after[n];
      if (charAfter === undefined || charAfter === " " || charAfter === "#" || charAfter === "@") {
        const newText = (text.slice(0, idx) + text.slice(idx + 1 + n)).replace(/\s+/g, " ").trim();
        return { text: newText, resolved: c.item };
      }
    }
    searchFrom = idx + 1;
  }
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseQuickAdd(raw: string, projects: Project[], people: Profile[]) {
  let text = raw;

  // Trailing standalone priority token only - "fix login p1" resolves,
  // "the p0 bug is fixed" doesn't (p0 isn't the last token).
  let priority: Priority | null = null;
  const priorityMatch = /(^|\s)(p[0-3])\s*$/i.exec(text);
  if (priorityMatch) {
    const start = priorityMatch.index + priorityMatch[1].length;
    const before = text.slice(0, start).trim();
    if (before.length > 0) {
      priority = priorityMatch[2].toUpperCase() as Priority;
      text = text.slice(0, start).trimEnd();
    }
  }

  const projectResult = resolveToken(
    text,
    "#",
    projects.map((p) => ({ label: p.name, item: p })),
  );
  text = projectResult.text;

  const reviewerResult = resolveToken(
    text,
    "@",
    people.map((p) => ({ label: p.name ?? p.email ?? "", item: p })),
  );
  text = reviewerResult.text;

  return {
    cleanedContent: text,
    priority,
    project: projectResult.resolved,
    reviewer: reviewerResult.resolved,
  };
}

export function QuickAddBar({
  projects,
  people,
  onSubmit,
}: {
  projects: Project[];
  people: Profile[];
  onSubmit: (result: QuickAddResult) => void;
}) {
  const [text, setText] = useState("");

  const parsed = useMemo(() => parseQuickAdd(text, projects, people), [text, projects, people]);
  const hasChips = parsed.priority || parsed.project || parsed.reviewer;

  function removeChip(kind: "priority" | "project" | "reviewer") {
    // Chips are derived from the raw text, so "removing" one means mangling
    // the matched substring in the source text so it stops matching - cheap
    // and correct, no separate chip-state to keep in sync.
    if (kind === "priority") {
      setText((t) => t.replace(/(^|\s)(p[0-3])\s*$/i, "$1").trimEnd());
    } else if (kind === "project" && parsed.project) {
      setText((t) =>
        t
          .replace(new RegExp(`#${escapeRegExp(parsed.project!.name)}`, "i"), "")
          .replace(/\s+/g, " ")
          .trim(),
      );
    } else if (kind === "reviewer" && parsed.reviewer) {
      const label = parsed.reviewer.name ?? parsed.reviewer.email ?? "";
      setText((t) =>
        t
          .replace(new RegExp(`@${escapeRegExp(label)}`, "i"), "")
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  }

  function submit() {
    if (!parsed.cleanedContent.trim()) return;
    onSubmit({
      content: parsed.cleanedContent.trim(),
      priority: parsed.priority ?? "P2",
      projectId: parsed.project?.id ?? null,
      reviewerId: parsed.reviewer?.id ?? null,
    });
    setText("");
  }

  return (
    <div className="mb-6">
      {hasChips && (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {parsed.priority && (
            <Badge tone="default">
              {parsed.priority}
              <button
                onClick={() => removeChip("priority")}
                aria-label="Remove priority"
                className="ml-1"
              >
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {parsed.project && (
            <Badge tone="info">
              {parsed.project.emoji_icon ?? "📁"} {parsed.project.name}
              <button
                onClick={() => removeChip("project")}
                aria-label="Remove project"
                className="ml-1"
              >
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {parsed.reviewer && (
            <Badge tone="warn">
              👀 Review: {parsed.reviewer.name ?? parsed.reviewer.email}
              <button
                onClick={() => removeChip("reviewer")}
                aria-label="Remove reviewer"
                className="ml-1"
              >
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="What are you working on? Try #project, @reviewer, or p0–p3 at the end…"
          className="h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={submit}
          disabled={!parsed.cleanedContent.trim()}
          aria-label="Post update"
          className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
