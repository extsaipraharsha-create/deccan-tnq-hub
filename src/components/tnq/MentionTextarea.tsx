import { useRef, useState } from "react";

type Person = { id: string; name: string | null; email: string | null };

// A plain textarea that pops a filtered people-list when you type "@" —
// picking one inserts "@Full Name " as plain text at that spot. Not a rich
// mention token (no separate stored ids) — just a fast way to type a name
// without hunting for it, matching how the rest of this app's text fields
// (worklog content, announcements, recognitions) work.
export function MentionTextarea({
  value,
  onChange,
  people,
  placeholder,
  className = "",
  minHeight = "min-h-20",
}: {
  value: string;
  onChange: (v: string) => void;
  people: Person[];
  placeholder?: string;
  className?: string;
  minHeight?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [queryStart, setQueryStart] = useState(0);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    onChange(v);
    const cursor = e.target.selectionStart ?? v.length;
    const before = v.slice(0, cursor);
    const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
    if (match) {
      setQuery(match[1]);
      setQueryStart(cursor - match[1].length - 1);
    } else {
      setQuery(null);
    }
  }

  const filtered =
    query === null
      ? []
      : people
          .filter((p) => (p.name ?? p.email ?? "").toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);

  function pick(p: Person) {
    const name = (p.name ?? p.email ?? "").trim();
    const before = value.slice(0, queryStart);
    const after = value.slice(queryStart + 1 + (query?.length ?? 0));
    onChange(`${before}@${name} ${after}`);
    setQuery(null);
    requestAnimationFrame(() => ref.current?.focus());
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery(null);
        }}
        placeholder={placeholder}
        className={`${minHeight} w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
      />
      {query !== null && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-56 max-h-40 overflow-y-auto rounded-lg border border-border bg-card shadow-pop">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p)}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
            >
              {p.name ?? p.email}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
