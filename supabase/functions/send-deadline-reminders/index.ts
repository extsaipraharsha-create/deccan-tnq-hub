// Deploy with: supabase functions deploy send-deadline-reminders --no-verify-jwt
// Triggered on a schedule by pg_cron (see the migration/cron SQL). Sends:
// - "due in 1 hour" once per task
// - "deadline passed" once per task
// - a distinct P0 escalation once a still-overdue P0 has already gotten the
//   general overdue push (separate flag so it can re-flag critical work)
// - a review-request reminder once a pending request has sat 24h+ unanswered
// All gated by columns/timestamps so nothing repeats every 10-minute tick.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails("mailto:ops@deccan.ai", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Entry = { id: string; user_id: string; content: string; deadline: string };
type ReviewRequest = { id: string; entry_id: string; reviewer_id: string };
type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [{ data: upcoming }, { data: overdue }, { data: p0Escalations }, { data: staleReviews }] =
    await Promise.all([
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
      supabase
        .from("work_log_entries")
        .select("id,user_id,content,deadline")
        .eq("priority", "P0")
        .is("completed_at", null)
        .not("overdue_notified_at", "is", null)
        .is("p0_escalation_sent_at", null)
        .lt("deadline", now.toISOString()),
      supabase
        .from("work_log_review_requests")
        .select("id,entry_id,reviewer_id")
        .eq("status", "pending")
        .lt("created_at", twentyFourHoursAgo.toISOString())
        .or(
          `reminder_last_sent_at.is.null,reminder_last_sent_at.lt.${twentyFourHoursAgo.toISOString()}`,
        ),
    ]);

  const results = { upcoming: 0, overdue: 0, p0Escalated: 0, reviewReminders: 0 };

  for (const entry of (upcoming ?? []) as Entry[]) {
    const sent = await notifyUser(supabase, entry.user_id, entry.content, "Due in 1 hour");
    if (sent) {
      await supabase
        .from("work_log_entries")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", entry.id);
      results.upcoming++;
    }
  }

  for (const entry of (overdue ?? []) as Entry[]) {
    const sent = await notifyUser(
      supabase,
      entry.user_id,
      entry.content,
      "Deadline passed — update needed",
    );
    if (sent) {
      await supabase
        .from("work_log_entries")
        .update({ overdue_notified_at: new Date().toISOString() })
        .eq("id", entry.id);
      results.overdue++;
    }
  }

  for (const entry of (p0Escalations ?? []) as Entry[]) {
    const sent = await notifyUser(
      supabase,
      entry.user_id,
      entry.content,
      "🔴 P0 still overdue — needs attention",
    );
    if (sent) {
      await supabase
        .from("work_log_entries")
        .update({ p0_escalation_sent_at: new Date().toISOString() })
        .eq("id", entry.id);
      results.p0Escalated++;
    }
  }

  for (const req of (staleReviews ?? []) as ReviewRequest[]) {
    const sent = await notifyUser(
      supabase,
      req.reviewer_id,
      "A review request has been waiting 24h+",
      "⏰ Review reminder",
    );
    if (sent) {
      await supabase
        .from("work_log_review_requests")
        .update({ reminder_last_sent_at: new Date().toISOString() })
        .eq("id", req.id);
      results.reviewReminders++;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
});

// deno-lint-ignore no-explicit-any
async function notifyUser(
  supabase: any,
  userId: string,
  content: string,
  title: string,
): Promise<boolean> {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .eq("user_id", userId);
  if (!subs || subs.length === 0) return false;

  const body = content.length > 120 ? content.slice(0, 117) + "…" : content;
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
