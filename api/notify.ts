// Sends a Web Push to every device subscribed for the target side.
// Secrets (Supabase service role, VAPID private key) live in Vercel env vars.
import webpush from "web-push";

function message(type: string, fromName: string): { body: string; url: string } | null {
  const who = fromName || null;
  if (type === "moment") {
    return {
      body: who
        ? `📸 ${who}が「今日の瞬間」を投稿したよ / ${who} publicó un momento`
        : "📸 相手が「今日の瞬間」を投稿したよ / Tu pareja publicó un momento",
      url: "/moment",
    };
  }
  if (type === "quiz") {
    return {
      body: who
        ? `🔮 ${who}が心理テストに答えたよ / ${who} respondió el test de hoy`
        : "🔮 相手が心理テストに答えたよ / Tu pareja respondió el test de hoy",
      url: "/quiz",
    };
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const origin: string = req.headers.origin ?? "";
  const host: string = req.headers.host ?? "";
  if (origin && host && !origin.includes(host)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } =
    process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  const { type, toRole, fromName } = req.body ?? {};
  const msg = message(String(type), String(fromName ?? "").slice(0, 30));
  if (!msg || !["A", "B"].includes(toRole)) {
    return res.status(400).json({ error: "bad_input" });
  }

  const sbHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const listUrl = `${SUPABASE_URL}/rest/v1/push_subscriptions?role=eq.${toRole}&select=endpoint,subscription`;
  const listRes = await fetch(listUrl, { headers: sbHeaders });
  if (!listRes.ok) return res.status(502).json({ error: "db" });
  const rows: { endpoint: string; subscription: webpush.PushSubscription }[] = await listRes.json();

  webpush.setVapidDetails(VAPID_SUBJECT ?? "mailto:futari@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const payload = JSON.stringify({
    title: "ふたりの時間",
    tag: `futari-${type}`,
    ...msg,
  });

  let sent = 0;
  await Promise.all(
    rows.map(async row => {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent++;
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // subscription expired — clean it up
          await fetch(
            `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`,
            { method: "DELETE", headers: sbHeaders },
          ).catch(() => {});
        }
      }
    }),
  );

  return res.status(200).json({ sent, total: rows.length });
}
