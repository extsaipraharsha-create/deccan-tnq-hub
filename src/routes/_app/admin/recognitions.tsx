/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Textarea, Select, Field, Modal, EmptyState } from "@/components/tnq/ui";
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
  const [form, setForm] = useState({ contributor_id: "", message: "" });

  async function load() {
    setLoading(true);
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
  }
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  async function add() {
    if (!form.contributor_id || !form.message.trim()) {
      toast.error("Pick a person and write a message");
      return;
    }
    const { error } = await (supabase as any).from("recognitions").insert({
      contributor_id: form.contributor_id,
      given_by: user?.id,
      message: form.message.trim(),
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setForm({ contributor_id: "", message: "" });
    toast.success("Posted to Wall of Excellence");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Remove this recognition?")) return;
    const { error } = await (supabase as any).from("recognitions").delete().eq("id", id);
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-10 w-10" />}
            title="No recognitions yet"
            subtitle="Give the first one above."
          />
        ) : (
          <div className="divide-y divide-border -m-5">
            {items.map((r) => (
              <div key={r.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{who(r.contributor_id)}</div>
                  <div className="mt-0.5 text-sm text-foreground/90 whitespace-pre-wrap">
                    {r.message}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmtDate(r.created_at)} · by {who(r.given_by)}
                  </div>
                </div>
                {(isAdmin || r.given_by === user?.id) && (
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
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
        <Field label="Person">
          <Select
            value={form.contributor_id}
            onChange={(e) => setForm({ ...form, contributor_id: e.target.value })}
          >
            <option value="">Select person…</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Message">
          <Textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 300) })}
            placeholder="e.g. Shipped the L2 pipeline gold labels a day early — great work!"
            className="min-h-20"
          />
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/recognitions")({ component: RecognitionsPage });
