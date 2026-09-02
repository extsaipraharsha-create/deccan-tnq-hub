// Deploy with: supabase functions deploy send-notification
// Generic push sender (normal JWT verification, client-invoked) - takes any
// title/body/url and a list of recipient user ids. Used by the review
// request workflow (assigned / approved / changes requested); reusable for
// future notification needs instead of writing a new function each time.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails("mailto:ops@deccan.ai", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type Sub = { id: string; endpoint: string; p256dh: string; auth: string };

Deno.serve(async (req) => {
  const { user_ids, title, body, url } = (await req.json()) as {
    user_ids?: string[];
    title?: string;
    body?: string;
    url?: string;
  };
  if (!Array.isArray(user_ids) || user_ids.length === 0 || !title) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  let sent = 0;

  for (const uid of user_ids) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", uid);

    for (const sub of (subs ?? []) as Sub[]) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body: body ?? "", url: url ?? "/worklog" }),
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
