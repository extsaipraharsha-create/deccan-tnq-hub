// Local-timezone day key, shared by every surface that needs "which day did
// this happen on" (worklog entries, reports, the team roster). Always
// reconstructs a Date and reads the LOCAL getters, so it's correct
// regardless of whether the input string round-tripped through
// toISOString() first - this is what makes it safe to use for UTC-stored
// timestamps without a UTC/local day-boundary bug.
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type ActivitySource = {
  entries: {
    user_id: string;
    created_at: string;
    completed_at?: string | null;
    updated_at?: string | null;
  }[];
  statusHistory?: { changed_by: string | null; changed_at: string }[];
  comments?: { author_id: string; created_at: string }[];
};

export type ActivityIndex = Map<string, Map<string, number>>;

// One shared definition of "this person did something on this day" -
// creating an entry, completing one, editing one, changing an entry's
// status (work_log_entry_status_history), or posting a comment - so the
// roster heatmap, the "active today" status, and any report metric that
// cares about activity all agree on the same answer. Returns a
// userId -> dayKey -> event-count index; callers that only need "did
// anything happen" use the keys, callers that want intensity (heatmap)
// use the counts.
export function buildActivityIndex(source: ActivitySource): ActivityIndex {
  const index: ActivityIndex = new Map();
  function bump(userId: string | null | undefined, iso: string | null | undefined) {
    if (!userId || !iso) return;
    const key = dayKey(iso);
    const byDay = index.get(userId) ?? new Map<string, number>();
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
    index.set(userId, byDay);
  }
  for (const e of source.entries) {
    bump(e.user_id, e.created_at);
    if (e.completed_at) bump(e.user_id, e.completed_at);
    if (e.updated_at && e.updated_at !== e.created_at) bump(e.user_id, e.updated_at);
  }
  for (const h of source.statusHistory ?? []) {
    bump(h.changed_by, h.changed_at);
  }
  for (const c of source.comments ?? []) {
    bump(c.author_id, c.created_at);
  }
  return index;
}

export function activityDaysForUser(index: ActivityIndex, userId: string): Set<string> {
  return new Set(index.get(userId)?.keys() ?? []);
}

export function activityCountOnDay(index: ActivityIndex, userId: string, day: string): number {
  return index.get(userId)?.get(day) ?? 0;
}

// Latest raw activity instant per user (same event set as buildActivityIndex),
// as an actual ISO timestamp rather than a day key - needed for "how many
// days since their last activity" math, where re-parsing a "YYYY-MM-DD" day
// key back into a Date would reintroduce a UTC/local offset bug.
export function buildLastActivityIndex(source: ActivitySource): Map<string, string> {
  const last = new Map<string, string>();
  function consider(userId: string | null | undefined, iso: string | null | undefined) {
    if (!userId || !iso) return;
    const prev = last.get(userId);
    if (!prev || iso > prev) last.set(userId, iso);
  }
  for (const e of source.entries) {
    consider(e.user_id, e.created_at);
    if (e.completed_at) consider(e.user_id, e.completed_at);
    if (e.updated_at && e.updated_at !== e.created_at) consider(e.user_id, e.updated_at);
  }
  for (const h of source.statusHistory ?? []) {
    consider(h.changed_by, h.changed_at);
  }
  for (const c of source.comments ?? []) {
    consider(c.author_id, c.created_at);
  }
  return last;
}
