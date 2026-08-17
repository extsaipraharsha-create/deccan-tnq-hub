/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { Modal, Button, Select, Input, Textarea } from "@/components/tnq/ui";
import { toast } from "sonner";

type OverdueEntry = { id: string; content: string; deadline: string };

const REASONS = ["Blocked", "Underestimated", "Waiting on someone", "Other"];

// One-shot-per-session nudge: if a poster has a task whose deadline passed
// with no completed_at, ask them to close it out or push the deadline with a
// reason. Dismissing (X / backdrop) just hides it for this session — it
// reappears next time the app loads if still unresolved, rather than
// re-popping immediately, so it stays out of the way once seen.
export function DeadlineEscalationModal() {
  const { user, role } = useAuth();
  const canHaveDeadlines = role === "super_admin" || role === "tnq_team";
  const [queue, setQueue] = useState<OverdueEntry[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"choice" | "reschedule">("choice");
  const [reason, setReason] = useState(REASONS[0]);
  const [newDeadline, setNewDeadline] = useState("");
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!user || !canHaveDeadlines) return;
    const { data } = await (supabase as any)
      .from("work_log_entries")
      .select("id,content,deadline")
      .eq("user_id", user.id)
      .is("completed_at", null)
      .lt("deadline", new Date().toISOString())
      .order("deadline", { ascending: true });
    setQueue((data as OverdueEntry[]) ?? []);
  }
  useEffect(() => {
    load();
  }, [user?.id]);
  useAutoRefresh(load, 60000);

  const current = queue.find((e) => !dismissed.has(e.id)) ?? null;

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

  async function markComplete() {
    if (!current) return;
    setSaving(true);
    const { error } = await supabase
      .from("work_log_entries")
      .update({ completed_at: new Date().toISOString() } as any)
      .eq("id", current.id);
    setSaving(false);
    if (error) return toast.error(error.message);
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
    <Modal open title="Overdue task" onClose={dismiss}>
      <p className="text-sm text-muted-foreground">
        This task's deadline passed. What's the status?
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
            Still going — reschedule
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
