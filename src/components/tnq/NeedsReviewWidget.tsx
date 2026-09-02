/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Card, Button, Textarea, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Eye, Check, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

type ReviewRequest = {
  id: string;
  entry_id: string;
  requested_by: string;
  reviewer_id: string;
  status: string;
  created_at: string;
};
type Entry = { id: string; content: string };
type Profile = { id: string; name: string | null; email: string | null };

// Hard-to-miss by design: shown on both Dashboard and Worklog, plus a nav
// badge (see use-pending-review-count.ts) - anyone can be picked as a
// reviewer, not just SME/admin, so this isn't role-gated.
export function NeedsReviewWidget() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");

  const load = async () => {
    if (!user) return;
    const { data: r } = await (supabase as any)
      .from("work_log_review_requests")
      .select("*")
      .eq("reviewer_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const reqs = (r as ReviewRequest[]) ?? [];
    setRequests(reqs);
    if (reqs.length > 0) {
      const [{ data: e }, { data: p }] = await Promise.all([
        supabase
          .from("work_log_entries")
          .select("id,content")
          .in(
            "id",
            reqs.map((x) => x.entry_id),
          ),
        supabase
          .from("profiles")
          .select("id,name,email")
          .in(
            "id",
            reqs.map((x) => x.requested_by),
          ),
      ]);
      setEntries((e as Entry[]) ?? []);
      setProfiles((p as Profile[]) ?? []);
    } else {
      setEntries([]);
      setProfiles([]);
    }
  };
  useEffect(() => {
    load();
  }, [user]);
  useEffect(() => {
    const ch = supabase
      .channel("needs-review-widget")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_log_review_requests" },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function approve(reqId: string, requestedBy: string) {
    const { error } = await (supabase as any)
      .from("work_log_review_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", reqId);
    if (error) return toast.error(error.message);
    toast.success("Approved");
    supabase.functions
      .invoke("send-notification", {
        body: {
          user_ids: [requestedBy],
          title: "✅ Review approved",
          body: "Your worklog entry was approved.",
          url: "/worklog",
        },
      })
      .catch(() => {});
  }
  async function submitChanges(reqId: string, entryId: string, requestedBy: string) {
    if (!explanation.trim()) return;
    const { error } = await (supabase as any)
      .from("work_log_review_requests")
      .update({ status: "changes_requested", reviewed_at: new Date().toISOString() })
      .eq("id", reqId);
    if (error) return toast.error(error.message);
    await (supabase as any)
      .from("work_log_comments")
      .insert({ entry_id: entryId, author_id: user?.id, body: explanation.trim() });
    setRespondingId(null);
    setExplanation("");
    toast.success("Changes requested");
    supabase.functions
      .invoke("send-notification", {
        body: {
          user_ids: [requestedBy],
          title: "✏️ Changes requested",
          body: explanation.trim(),
          url: "/worklog",
        },
      })
      .catch(() => {});
  }

  if (requests.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-primary" />
        <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
          Needs your review
        </div>
        <Badge tone="warn">{requests.length}</Badge>
      </div>
      <div className="space-y-3">
        {requests.map((r) => {
          const entry = entries.find((e) => e.id === r.entry_id);
          const requester = profiles.find((p) => p.id === r.requested_by);
          return (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Requested by {requester?.name ?? requester?.email ?? "—"}
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {entry?.content ?? "—"}
              </div>
              {respondingId === r.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="What needs to change?"
                    className="min-h-15"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => submitChanges(r.id, r.entry_id, r.requested_by)}>
                      Send
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRespondingId(null);
                        setExplanation("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => approve(r.id, r.requested_by)}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setRespondingId(r.id)}>
                    <MessageSquareWarning className="h-3.5 w-3.5" /> Request changes
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
