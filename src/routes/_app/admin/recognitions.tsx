/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Card, Button, Field, Modal, EmptyState } from "@/components/tnq/ui";
import { MentionTextarea } from "@/components/tnq/MentionTextarea";
import { ReactionBar, type Reaction } from "@/components/tnq/ReactionBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  given_by: string;
  message: string;
  created_at: string;
}
interface Recipient {
  id: string;
  post_id: string;
  contributor_id: string;
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

// Who does this message actually @mention? Matched against real names/emails
// rather than parsed out of the text, so "@Sai Praharsha" resolves cleanly
// even though the name itself contains a space.
function deriveRecipients(message: string, people: Prof[]): Prof[] {
  return people.filter((p) => {
    const name = (p.name ?? p.email ?? "").trim();
    return name && message.includes(`@${name}`);
  });
}

function RecognitionsPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "super_admin";
  const [posts, setPosts] = useState<Post[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const loadedOnce = useRef(false);

  async function load() {
    if (!loadedOnce.current) setLoading(true);
    const [{ data: p }, { data: r }, { data: rx }, { data: pr }] = await Promise.all([
      (supabase as any)
        .from("recognition_posts")
        .select("*")
        .order("created_at", { ascending: false }),
      (supabase as any).from("recognition_recipients").select("*"),
      (supabase as any).from("recognition_reactions").select("*"),
      supabase.from("profiles").select("id,name,email,photo_url").order("name"),
    ]);
    setPosts((p as Post[]) ?? []);
    setRecipients((r as Recipient[]) ?? []);
    setReactions((rx as Reaction[]) ?? []);
    setProfiles((pr as Prof[]) ?? []);
    setLoading(false);
    loadedOnce.current = true;
  }
  useEffect(() => {
    load();
  }, []);
  useAutoRefresh(load);

  // Realtime: reflect posts/recipients/reactions from anyone, instantly.
  useEffect(() => {
    const ch = supabase
      .channel("recognitions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recognition_posts" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recognition_recipients" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recognition_reactions" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const who = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p?.name ?? p?.email ?? "—";
  };
  const recipientsFor = (postId: string) =>
    recipients.filter((r) => r.post_id === postId).map((r) => r.contributor_id);
  const reactionsFor = (postId: string) => reactions.filter((r) => r.post_id === postId);
  const previewRecipients = deriveRecipients(message, profiles);

  async function post() {
    if (!message.trim()) {
      toast.error("Write a message");
      return;
    }
    if (previewRecipients.length === 0) {
      toast.error("Type @ and pick at least one person to recognize");
      return;
    }
    setPosting(true);
    const { data: newPost, error } = await (supabase as any)
      .from("recognition_posts")
      .insert({ given_by: user?.id, message: message.trim() })
      .select()
      .single();
    if (error) {
      setPosting(false);
      return toast.error(error.message);
    }
    const { error: recError } = await (supabase as any).from("recognition_recipients").insert(
      previewRecipients.map((p) => ({ post_id: newPost.id, contributor_id: p.id })),
    );
    if (recError) {
      setPosting(false);
      return toast.error(recError.message);
    }
    setPosting(false);
    setOpen(false);
    setMessage("");
    toast.success(
      previewRecipients.length > 1
        ? `Posted to Wall of Excellence for ${previewRecipients.length} people`
        : "Posted to Wall of Excellence",
    );
    load();
    // Best-effort push to whoever's subscribed — a failure here shouldn't
    // undo the post, so it's fire-and-forget.
    supabase.functions
      .invoke("send-recognition-push", {
        body: { contributor_ids: previewRecipients.map((p) => p.id), message: message.trim() },
      })
      .catch(() => {});
  }
  async function remove(postId: string) {
    if (!confirm("Remove this recognition?")) return;
    const { error } = await (supabase as any).from("recognition_posts").delete().eq("id", postId);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

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
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-10 w-10" />}
            title="No recognitions yet"
            subtitle="Give the first one above."
          />
        ) : (
          <div className="divide-y divide-border -m-5">
            {posts.map((p) => (
              <div key={p.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {recipientsFor(p.id).map(who).join(", ") || "—"}
                  </div>
                  <div className="mt-0.5 text-sm text-foreground/90 whitespace-pre-wrap">
                    {p.message}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmtDate(p.created_at)} · by {who(p.given_by)}
                  </div>
                  <ReactionBar
                    postId={p.id}
                    reactions={reactionsFor(p.id)}
                    userId={user?.id}
                    onChange={load}
                  />
                </div>
                {(isAdmin || p.given_by === user?.id) && (
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
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
            <Button onClick={post} disabled={posting}>
              {posting ? "Posting…" : "Post"}
            </Button>
          </>
        }
      >
        <Field
          label="Message"
          hint={
            previewRecipients.length > 0
              ? `Recognizing: ${previewRecipients.map((p) => p.name ?? p.email).join(", ")}`
              : "Type @ and pick everyone this is for — they're the recipients."
          }
        >
          <MentionTextarea
            value={message}
            onChange={(v) => setMessage(v.slice(0, 300))}
            people={profiles}
            placeholder="e.g. Great work from @Sai Praharsha and @Siddhi Jain shipping the L2 pipeline early!"
            minHeight="min-h-24"
          />
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/admin/recognitions")({ component: RecognitionsPage });
