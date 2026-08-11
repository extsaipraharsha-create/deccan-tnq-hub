// Deploy with: supabase functions deploy send-deadline-reminders --no-verify-jwt
// Triggered on a schedule by pg_cron (see the migration/cron SQL). Sends one
// push per task: "due in 1 hour" once per task, and "deadline passed" once
// per task, both gated by columns on work_log_entries so nothing repeats.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails("mailto:ops@deccan.ai", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Entry = { id: string; user_id: string; content: string; deadline: string };
type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const [{ data: upcoming }, { data: overdue }] = await Promise.all([
    supabase
      .from("work_log_entries")
      .select("id,user_id,content,deadline")
      .is("completed_at", null)
      .is("reminder_sent_at", null)
      .gt("deadline", now.toISOString())
      .lte("deadline", oneHourFromNow.toISOString()),
    supabase
      .from("work_log_entries")
      .select("id,user_id,content,deadline")
      .is("completed_at", null)
      .is("overdue_notified_at", null)
      .lt("deadline", now.toISOString()),
  ]);

  const results = { upcoming: 0, overdue: 0 };

  for (const entry of (upcoming ?? []) as Entry[]) {
    const sent = await notifyUser(supabase, entry, "Due in 1 hour");
    if (sent) {
      await supabase
        .from("work_log_entries")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", entry.id);
      results.upcoming++;
    }
  }

  for (const entry of (overdue ?? []) as Entry[]) {
    const sent = await notifyUser(supabase, entry, "Deadline passed — update needed");
    if (sent) {
      await supabase
        .from("work_log_entries")
        .update({ overdue_notified_at: new Date().toISOString() })
        .eq("id", entry.id);
      results.overdue++;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
});

// deno-lint-ignore no-explicit-any
async function notifyUser(supabase: any, entry: Entry, title: string): Promise<boolean> {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .eq("user_id", entry.user_id);
  if (!subs || subs.length === 0) return false;

  const body = entry.content.length > 120 ? entry.content.slice(0, 117) + "…" : entry.content;
  let sentAny = false;

  for (const sub of subs as Sub[]) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: "/worklog" }),
      );
      sentAny = true;
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Browser unsubscribed or the subscription expired — prune it.
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
  return sentAny;
}
