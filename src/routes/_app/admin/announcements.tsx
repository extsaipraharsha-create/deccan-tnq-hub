/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, EmptyState } from "@/components/tnq/ui";
import { MentionTextarea } from "@/components/tnq/MentionTextarea";
import { Confetti } from "@/components/tnq/Confetti";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Save } from "lucide-react";
import { toast } from "sonner";

type Person = { id: string; name: string | null; email: string | null };

function AnnouncementsPage() {
  const [text, setText] = useState("");
  const [current, setCurrent] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);

  async function load() {
    setLoading(true);
    const [{ data, error }, { data: p }] = await Promise.all([
      supabase.from("settings").select("value").eq("key", "announcement").limit(1).maybeSingle(),
      supabase.from("profiles").select("id,name,email"),
    ]);
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Intentionally does NOT prefill the compose box — it always starts
    // empty (a "write a new one" box), independent of what's live. The
    // live value only shows in the "Currently live" preview below.
    setCurrent((data?.value as string) ?? "");
    setPeople((p as Person[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "announcement", value: text }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    setCurrent(text);
    if (text.trim()) setCelebrate((c) => c + 1);
    setText("");
    setSavedAt(new Date().toLocaleTimeString());
    toast.success(text ? "Announcement saved" : "Announcement cleared");
  }

  return (
    <div>
      <Confetti fire={celebrate} />
      <PageHeader
        title="Admin · Announcements"
        subtitle="Shown as a dismissible banner on every page, for every role."
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <MentionTextarea
              value={text}
              onChange={setText}
              people={people}
              placeholder="Write a short announcement, then Save to broadcast it. Type @ to mention someone."
              minHeight="min-h-35"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {savedAt && `Saved at ${savedAt}`}
              </div>
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase mb-2">
                Currently live
              </div>
              {current ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{current}</p>
              ) : (
                <EmptyState
                  icon={<Megaphone className="h-10 w-10" />}
                  title="No announcement live"
                  subtitle="Write one above and save to broadcast it."
                />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/announcements")({ component: AnnouncementsPage });
