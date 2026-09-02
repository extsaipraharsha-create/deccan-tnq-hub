import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";

const DISMISS_KEY = "tnq_announcement_dismissed";

// The Admin > Announcements page writes to settings.announcement — this is
// the only place that value is ever actually shown. Dismissing hides it for
// this browser until the text changes (compares against what was dismissed),
// so a fresh announcement always resurfaces even if an old one was dismissed.
export function AnnouncementBanner() {
  const [text, setText] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle();
    setText((data?.value as string) ?? null);
  }
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  if (!text || !text.trim()) return null;
  if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === text) return null;

  return (
    <div className="flex items-start gap-3 bg-primary/10 border-b border-primary/20 px-5 py-2.5 lg:px-8">
      <Megaphone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-foreground whitespace-pre-wrap">{text}</p>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, text);
          setText(null);
        }}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
