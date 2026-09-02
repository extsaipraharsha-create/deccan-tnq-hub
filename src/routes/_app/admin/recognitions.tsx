/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Card, Button, Field, Modal, EmptyState } from "@/components/tnq/ui";
import { MentionTextarea } from "@/components/tnq/MentionTextarea";
import { Confetti } from "@/components/tnq/Confetti";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Recognition {
  id: string;
  contributor_id: string;
  given_by: string;
  message: string;
  created_at: string;
}
interface Prof {
  id: string;
  name: string | null;
  email: string | null;
  photo_url: string | null;
}
// One row per recipient, but everyone picked in the same submission shares
// the exact same given_by/message/created_at (Postgres evaluates now() once
// per insert statement) — group them back into one card, same trick used
// for Worklog's "posted together" batching.
type Batch = { key: string; given_by: string; message: string; created_at: string; contributor_ids: string[] };
function groupRecognitions(items: Recognition[]): Batch[] {
  const map = new Map<string, Batch>();
  for (const r of items) {
    const k = `${r.given_by}|${r.message}|${r.created_at}`;
    const b = map.get(k) ?? {
      key: k,
      given_by: r.given_by,
      message: r.message,
      created_at: r.created_at,
      contributor_ids: [],
    };
    b.contributor_ids.push(r.contributor_id);
    map.set(k, b);
  }
  return Array.from(map.values());
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RecognitionsPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "super_admin";
  const [items, setItems] = useState<Recognition[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ contributor_ids: string[]; message: string }>({
    contributor_ids: [],
    message: "",
  });
  const [celebrate, setCelebrate] = useState(0);
  const loadedOnce = useRef(false);

  async function load() {
    if (!loadedOnce.current) setLoading(true);
    const [{ data: r }, { data: p }] = await Promise.all([
      (supabase as any)
        .from("recognitions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,name,email,photo_url").order("name"),
    ]);
    setItems((r as Recognition[]) ?? []);
    setProfiles((p as Prof[]) ?? []);
    setLoading(false);
    loadedOnce.current = true;
  }
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  const batches = groupRecognitions(items);

  function toggleContributor(id: string) {
    setForm((prev) => ({
      ...prev,
      contributor_ids: prev.contributor_ids.includes(id)
        ? prev.contributor_ids.filter((x) => x !== id)
        : [...prev.contributor_ids, id],
    }));
  }
  async function add() {
    if (form.contributor_ids.length === 0 || !form.message.trim()) {
      toast.error("Pick at least one person and write a message");
      return;
    }
    const { error } = await (supabase as any)
      .from("recognitions")
      .insert(
        form.contributor_ids.map((contributor_id) => ({
          contributor_id,
          given_by: user?.id,
          message: form.message.trim(),
        })),
      );
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ contributor_ids: [], message: "" });
    setCelebrate((c) => c + 1);
    toast.success(
      form.contributor_ids.length > 1
        ? `Posted to Wall of Excellence for ${form.contributor_ids.length} people`
        : "Posted to Wall of Excellence",
    );
    load();
  }
  async function remove(batch: Batch) {
    if (!confirm("Remove this recognition?")) return;
    const ids = items
      .filter(
        (r) =>
          r.given_by === batch.given_by &&
          r.message === batch.message &&
          r.created_at === batch.created_at,
      )
      .map((r) => r.id);
    const { error } = await (supabase as any).from("recognitions").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }
  const who = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p?.name ?? p?.email ?? "—";
  };

  return (
    <div>
      <Confetti fire={celebrate} />
      <PageHeader
        title="Admin · Wall of Excellence"
        subtitle="Public shoutouts — shown on everyone's Dashboard."
        right={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Give recognition
          </Button>
        }
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : batches.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-10 w-10" />}
            title="No recognitions yet"
            subtitle="Give the first one above."
          />
        ) : (
          <div className="divide-y divide-border -m-5">
            {batches.map((b) => (
              <div key={b.key} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {b.contributor_ids.map(who).join(", ")}
                  </div>
                  <div className="mt-0.5 text-sm text-foreground/90 whitespace-pre-wrap">
                    {b.message}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmtDate(b.created_at)} · by {who(b.given_by)}
                  </div>
                </div>
                {(isAdmin || b.given_by === user?.id) && (
                  <Button size="sm" variant="ghost" onClick={() => remove(b)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Give recognition"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Post</Button>
          </>
        }
      >
        <Field
          label="People"
          hint={
            form.contributor_ids.length > 0
              ? `${form.contributor_ids.length} selected`
              : "Pick one or more — everyone selected gets this message, as one shared shoutout."
          }
        >
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {profiles.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={form.contributor_ids.includes(p.id)}
                  onChange={() => toggleContributor(p.id)}
                  className="h-4 w-4 rounded border-border"
                />
                {p.name ?? p.email}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Message">
          <MentionTextarea
            value={form.message}
            onChange={(v) => setForm({ ...form, message: v.slice(0, 300) })}
            people={profiles}
            placeholder="e.g. Shipped the L2 pipeline gold labels a day early — great work! Type @ to mention someone."
          />
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/recognitions")({ component: RecognitionsPage });
