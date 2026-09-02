/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Textarea, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { Megaphone, Save } from "lucide-react";
import { toast } from "sonner";

function AnnouncementsPage() {
  const [text, setText] = useState("");
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "announcement")
      .limit(1)
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const v = (data?.value as string) ?? "";
    setCurrent(v);
    setText(v);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  // Skip auto-refetch while the textarea no longer matches what's live
  // (either an unsaved edit, or it was just cleared after a save).
  useAutoRefresh(() => {
    if (text === current) load();
  });

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "announcement", value: text }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    setCurrent(text);
    setText("");
    setSavedAt(new Date().toLocaleTimeString());
    toast.success(text ? "Announcement saved" : "Announcement cleared");
  }

  return (
    <div>
      <PageHeader
        title="Admin · Announcements"
        subtitle="Shown as a dismissible banner on every page, for every role."
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a short announcement, then Save to broadcast it."
              className="min-h-35"
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
