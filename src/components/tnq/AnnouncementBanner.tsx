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
    <div className="px-5 pt-5 lg:px-8">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 pl-4 pr-3 py-3 shadow-soft border-l-4 border-l-primary">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Megaphone className="h-4 w-4 text-primary" />
        </div>
        <p className="flex-1 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{text}</p>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, text);
            setText(null);
          }}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
