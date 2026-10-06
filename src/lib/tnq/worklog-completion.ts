/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

export type EntryType =
  | "working_on"
  | "need_help"
  | "completed"
  | "blocked"
  | "review_needed"
  | "available_to_help";

export type CompletableEntry = {
  id: string;
  entry_type: EntryType;
  previous_entry_type?: EntryType | null;
};

const DEFAULT_RESTORE_TYPE: EntryType = "working_on";

// Single source of truth for marking a worklog entry complete or undoing
// that. Every surface - feed row, table row, board/detail modal, the
// deadline popup, the edit form, the one-tap checkbox, bulk actions - must
// call this instead of writing `entry_type`/`completed_at` directly, so the
// two can never drift out of sync again (an Oct 2026 audit found 290 of 421
// entries had completed_at set with a category that was never flipped).
//
// `restoreType` lets a caller land on a specific category when undoing
// (the edit form's category dropdown) instead of the stashed
// previous_entry_type - used when the user is explicitly choosing a
// different category, not just toggling completion off.
export async function setEntryCompleted(
  entry: CompletableEntry,
  completed: boolean,
  opts: { actingUserId: string; restoreType?: EntryType },
): Promise<{ error: string | null }> {
  if (completed) {
    if (entry.entry_type === "completed") return { error: null };
    const { error } = await (supabase as any)
      .from("work_log_entries")
      .update({
        entry_type: "completed",
        completed_at: new Date().toISOString(),
        completed_at_estimated: false,
        previous_entry_type: entry.entry_type,
      })
      .eq("id", entry.id);
    if (error) return { error: error.message };
    await closeOpenReviewRequests(entry.id, opts.actingUserId);
    return { error: null };
  }

  // Undo
  if (entry.entry_type !== "completed") return { error: null };
  const restoreTo = opts.restoreType ?? entry.previous_entry_type ?? DEFAULT_RESTORE_TYPE;
  const { error } = await (supabase as any)
    .from("work_log_entries")
    .update({
      entry_type: restoreTo,
      completed_at: null,
      completed_at_estimated: false,
      previous_entry_type: null,
    })
    .eq("id", entry.id);
  return { error: error?.message ?? null };
}

// Known limitation: `cancel_review_on_completion` only succeeds when the
// *requester* (whoever originally asked for review) is the one completing
// the entry - it checks `requested_by = auth.uid()` per spec. If an admin
// marks someone else's review-pending entry complete, the RPC silently
// no-ops and the review request is left open. Narrow edge case (admin
// bulk-completing another person's entry specifically while a review on it
// is still pending) - flagging rather than silently special-casing it.
async function closeOpenReviewRequests(entryId: string, actingUserId: string) {
  const { data } = await (supabase as any)
    .from("work_log_review_requests")
    .select("id, reviewer_id")
    .eq("entry_id", entryId)
    .eq("status", "pending");
  const pending = (data as { id: string; reviewer_id: string }[] | null) ?? [];
  if (pending.length === 0) return;

  await Promise.all(
    pending.map((r) => (supabase as any).rpc("cancel_review_on_completion", { request_id: r.id })),
  );
  await (supabase as any).from("work_log_comments").insert({
    entry_id: entryId,
    author_id: actingUserId,
    body: "Review closed automatically because the task was marked complete.",
  });
  supabase.functions
    .invoke("send-notification", {
      body: {
        user_ids: pending.map((r) => r.reviewer_id),
        title: "Review no longer needed",
        body: "The task you were asked to review was marked complete.",
        url: "/worklog",
      },
    })
    .catch(() => {});
}
