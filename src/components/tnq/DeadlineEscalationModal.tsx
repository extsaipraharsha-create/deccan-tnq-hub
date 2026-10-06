/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { Modal, Button, Select, Input, Textarea } from "@/components/tnq/ui";
import { isTeamRole } from "@/lib/tnq/types";
import { setEntryCompleted, type EntryType } from "@/lib/tnq/worklog-completion";
import { toast } from "sonner";

type OverdueEntry = {
  id: string;
  content: string;
  deadline: string;
  entry_type: EntryType;
  previous_entry_type: EntryType | null;
};

const REASONS = ["Blocked", "Underestimated", "Waiting on someone", "Other"];
const SNOOZE_MS = 60 * 60 * 1000;

// Surfaces two kinds of heads-up for a poster's own deadlines, sharing one
// modal: entries due within the next hour (not yet overdue) and entries
// already overdue, both excluding anything already completed. Dismissing
// (X / backdrop) hides it for this session only - it reappears next load if
// still unresolved. "Remind me in 1 hour" is different: it writes
// snoozed_until on the entry itself, so the snooze survives reloads and
// applies the same way on any device, not just this tab's session state.
export function DeadlineEscalationModal() {
  const { user, role } = useAuth();
  const canHaveDeadlines = role === "super_admin" || isTeamRole(role);
  const [queue, setQueue] = useState<OverdueEntry[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"choice" | "reschedule">("choice");
  const [reason, setReason] = useState(REASONS[0]);
  const [newDeadline, setNewDeadline] = useState("");
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!user || !canHaveDeadlines) return;
    const nowIso = new Date().toISOString();
    const inOneHour = new Date(Date.now() + SNOOZE_MS).toISOString();
    const { data } = await (supabase as any)
      .from("work_log_entries")
      .select("id,content,deadline,entry_type,previous_entry_type")
      .eq("user_id", user.id)
      .is("completed_at", null)
      .not("deadline", "is", null)
      .lte("deadline", inOneHour)
      .or(`snoozed_until.is.null,snoozed_until.lt.${nowIso}`)
      .order("deadline", { ascending: true });
    setQueue((data as OverdueEntry[]) ?? []);
  }
  useEffect(() => {
    load();
  }, [user?.id]);
  useAutoRefresh(load, 60000);

  const now = Date.now();
  const current = queue.find((e) => !dismissed.has(e.id)) ?? null;
  const urgency: "overdue" | "upcoming" =
    current && new Date(current.deadline).getTime() < now ? "overdue" : "upcoming";

  useEffect(() => {
    setMode("choice");
    setReason(REASONS[0]);
    setNewDeadline("");
    setExplanation("");
  }, [current?.id]);

  function dismiss() {
    if (!current) return;
    setDismissed((prev) => new Set(prev).add(current.id));
  }

  async function remindLater() {
    if (!current) return;
    const snoozedUntil = new Date(Date.now() + SNOOZE_MS).toISOString();
    const { error } = await supabase
      .from("work_log_entries")
      .update({ snoozed_until: snoozedUntil } as any)
      .eq("id", current.id);
    if (error) return toast.error(error.message);
    setQueue((prev) => prev.filter((e) => e.id !== current.id));
  }

  async function markComplete() {
    if (!current || !user) return;
    setSaving(true);
    const { error } = await setEntryCompleted(current, true, { actingUserId: user.id });
    setSaving(false);
    if (error) return toast.error(error);
    toast.success("Marked complete");
    setQueue((prev) => prev.filter((e) => e.id !== current.id));
  }

  async function submitReschedule() {
    if (!current || !newDeadline) return;
    setSaving(true);
    const iso = new Date(newDeadline).toISOString();
    const { error: logError } = await (supabase as any).from("work_log_delay_log").insert({
      entry_id: current.id,
      user_id: user!.id,
      old_deadline: current.deadline,
      new_deadline: iso,
      reason,
      explanation: explanation.trim() || null,
    } as any);
    if (logError) {
      setSaving(false);
      return toast.error(logError.message);
    }
    const { error } = await supabase
      .from("work_log_entries")
      .update({
        deadline: iso,
        deadline_updated_at: new Date().toISOString(),
        reminder_sent_at: null,
        overdue_notified_at: null,
      } as any)
      .eq("id", current.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Deadline updated");
    setQueue((prev) => prev.filter((e) => e.id !== current.id));
  }

  if (!current) return null;

  return (
    <Modal open title={urgency === "overdue" ? "Overdue task" : "Due soon"} onClose={dismiss}>
      <p className="text-sm text-muted-foreground">
        {urgency === "overdue"
          ? "This task's deadline passed. What's the status?"
          : "This task is due within the hour."}
      </p>
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
        {current.content}
      </div>
      {mode === "choice" ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={markComplete} disabled={saving}>
            Mark complete
          </Button>
          <Button variant="secondary" onClick={() => setMode("reschedule")} disabled={saving}>
            Extend deadline
          </Button>
          <Button variant="ghost" onClick={remindLater} disabled={saving}>
            Remind me in 1 hour
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Reason
            </span>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              New deadline
            </span>
            <Input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Explanation
            </span>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value.slice(0, 500))}
              placeholder="One line on what happened…"
              className="min-h-15"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setMode("choice")} disabled={saving}>
              Back
            </Button>
            <Button onClick={submitReschedule} disabled={saving || !newDeadline}>
              Save new deadline
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
