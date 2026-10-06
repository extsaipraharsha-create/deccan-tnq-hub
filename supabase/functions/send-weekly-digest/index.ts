// Deploy with: supabase functions deploy send-weekly-digest --no-verify-jwt
// Triggered once a week (Friday evening IST) by pg_cron. Sends each worklog
// user with activity that week a short push: completed, slipped (deadlines
// rescheduled), and currently open. weekly_digest_stats() only returns rows
// for users with some activity in the window, so zero-activity people are
// never queried for a subscription or sent anything.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails("mailto:ops@deccan.ai", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Stat = { user_id: string; completed_count: number; slipped_count: number; open_count: number };
type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

// Monday 00:00 IST through the following Monday 00:00 IST, as real UTC
// instants - a server cron has one clock, so this is "this week" the same
// way for everyone it runs for (unlike the in-app digest card, which reads
// each viewer's own browser-local week).
function weekBoundsIst(now: Date) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const daysSinceMonday = (istNow.getUTCDay() + 6) % 7;
  const istMidnight = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate());
  const weekStartIstWall = istMidnight - daysSinceMonday * 86400000;
  const weekEndIstWall = weekStartIstWall + 7 * 86400000;
  return {
    weekStart: new Date(weekStartIstWall - IST_OFFSET_MS),
    weekEnd: new Date(weekEndIstWall - IST_OFFSET_MS),
  };
}

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { weekStart, weekEnd } = weekBoundsIst(new Date());

  const { data: stats, error } = await supabase.rpc("weekly_digest_stats", {
    week_start: weekStart.toISOString(),
    week_end: weekEnd.toISOString(),
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let sent = 0;
  for (const row of (stats ?? []) as Stat[]) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", row.user_id);
    if (!subs || subs.length === 0) continue;

    const parts = [`${row.completed_count} completed`];
    if (row.slipped_count > 0) parts.push(`${row.slipped_count} slipped`);
    parts.push(`${row.open_count} open going into next week`);
    const body = parts.join(" · ");

    for (const sub of subs as Sub[]) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: "Your week in Worklog", body, url: "/worklog" }),
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent, usersWithActivity: (stats ?? []).length }), {
    headers: { "content-type": "application/json" },
  });
});
