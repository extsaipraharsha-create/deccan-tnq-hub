/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const EMOJIS = ["🎉", "👏", "🔥", "❤️", "👍"];

export type Reaction = { id: string; post_id: string; user_id: string; emoji: string };

// A Slack-style reaction row — anyone (any role) can tap an emoji to react
// or un-react. `reactions` is the already-fetched list for this one post;
// `onChange` re-pulls after a toggle so the count/highlight update.
export function ReactionBar({
  postId,
  reactions,
  userId,
  onChange,
}: {
  postId: string;
  reactions: Reaction[];
  userId: string | undefined;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(emoji: string) {
    if (!userId || busy) return;
    setBusy(emoji);
    const mine = reactions.find((r) => r.emoji === emoji && r.user_id === userId);
    if (mine) {
      await (supabase as any).from("recognition_reactions").delete().eq("id", mine.id);
    } else {
      await (supabase as any)
        .from("recognition_reactions")
        .insert({ post_id: postId, user_id: userId, emoji });
    }
    setBusy(null);
    onChange();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {EMOJIS.map((emoji) => {
        const count = reactions.filter((r) => r.emoji === emoji).length;
        const mine = reactions.some((r) => r.emoji === emoji && r.user_id === userId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => toggle(emoji)}
            disabled={!!busy}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-60 ${
              mine
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-mono text-[10px]">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
