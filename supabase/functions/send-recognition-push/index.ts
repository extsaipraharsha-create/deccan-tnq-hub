// Deploy with: supabase functions deploy send-recognition-push
// (normal JWT verification — invoked directly by the client right after
// posting a recognition, unlike send-deadline-reminders which is cron-only.)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails("mailto:ops@deccan.ai", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

Deno.serve(async (req) => {
  const { contributor_ids, message } = (await req.json()) as {
    contributor_ids?: string[];
    message?: string;
  };
  if (!Array.isArray(contributor_ids) || contributor_ids.length === 0 || !message) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const body = message.length > 120 ? message.slice(0, 117) + "…" : message;
  let sent = 0;

  for (const contributor_id of contributor_ids) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", contributor_id);

    for (const sub of (subs ?? []) as Sub[]) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: "🏆 You were recognized!", body, url: "/dashboard" }),
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

  return new Response(JSON.stringify({ sent }), {
    headers: { "content-type": "application/json" },
  });
});
