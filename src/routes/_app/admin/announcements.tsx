import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Textarea, EmptyState } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Save } from "lucide-react";

function AnnouncementsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "announcement")
      .maybeSingle();
    setText((data?.value as string) ?? "");
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    await supabase
      .from("settings")
      .upsert({ key: "announcement", value: text }, { onConflict: "key" });
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div>
      <PageHeader
        title="Admin · Announcements"
        subtitle="The current announcement appears on every dashboard."
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a short announcement. Leave blank to clear."
              className="min-h-[140px]"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {savedAt && `Saved at ${savedAt}`}
              </div>
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
            {!text && (
              <EmptyState
                icon={<Megaphone className="h-10 w-10" />}
                title="No announcement yet"
                subtitle="Add one above to broadcast to the team."
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/announcements")({ component: AnnouncementsPage });
