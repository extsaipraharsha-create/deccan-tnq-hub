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

  // dry_run: true computes the exact same recipient list, counts, and push
  // body text as a real run, but never calls webpush.sendNotification and
  // never prunes expired subscriptions - a pure preview. pg_cron's body is
  // always '{}', so a real run is unaffected; dry_run is only ever set by
  // a manual invocation.
  let dryRun = false;
  try {
    const body = await req.json();
    dryRun = body?.dry_run === true;
  } catch {
    // No/invalid JSON body - fine, defaults to a real run (matches the
    // cron job's plain '{}' call).
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

  const rows = (stats ?? []) as Stat[];
  let profileById = new Map<string, { name: string | null; email: string | null }>();
  if (dryRun && rows.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,name,email")
      .in(
        "id",
        rows.map((r) => r.user_id),
      );
    profileById = new Map(
      (profiles ?? []).map((p: { id: string; name: string | null; email: string | null }) => [
        p.id,
        { name: p.name, email: p.email },
      ]),
    );
  }

  let sent = 0;
  const preview: {
    user_id: string;
    name: string | null;
    completed_count: number;
    slipped_count: number;
    open_count: number;
    body: string;
    subscriptions: number;
  }[] = [];

  for (const row of rows) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", row.user_id);

    // Lead with what got done; with nothing completed, "0 completed" reads
    // as a knock even for someone who was genuinely active - so with
    // nothing completed, the open count fronts the message instead.
    const leadParts: string[] = [];
    if (row.completed_count > 0) leadParts.push(`${row.completed_count} completed`);
    if (row.slipped_count > 0) leadParts.push(`${row.slipped_count} slipped`);
    const openClause = `${row.open_count} open going into next week`;
    const body = leadParts.length > 0 ? [...leadParts, openClause].join(" · ") : openClause;

    if (dryRun) {
      const prof = profileById.get(row.user_id);
      preview.push({
        user_id: row.user_id,
        name: prof?.name ?? prof?.email ?? null,
        completed_count: row.completed_count,
        slipped_count: row.slipped_count,
        open_count: row.open_count,
        body,
        subscriptions: subs?.length ?? 0,
      });
      continue;
    }

    if (!subs || subs.length === 0) continue;
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

  if (dryRun) {
    return new Response(
      JSON.stringify({
        dryRun: true,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        usersWithActivity: rows.length,
        wouldSendTo: preview.filter((p) => p.subscriptions > 0).length,
        recipients: preview,
      }),
      { headers: { "content-type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ sent, usersWithActivity: rows.length }), {
    headers: { "content-type": "application/json" },
  });
});
