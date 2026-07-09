// Web Push subscription (client side). Subscriptions are stored in Supabase
// keyed by side; /api/notify sends pushes to the partner's devices.

import { SUPABASE_URL, SUPABASE_ANON } from "./supabase";

const VAPID_PUBLIC =
  "BJsEqBIK1xPEk8i-8_PbR9uCEGX-DFSbhFs1XUcsSDb48mzX_s-YeG274RHGMmKxAh75xRq5lzR9cpHpj1GiI3I";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushSetupResult = "ok" | "denied" | "unsupported" | "error";

export async function enablePush(role: "A" | "B"): Promise<PushSetupResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  if ((await Notification.requestPermission()) !== "granted") return "denied";

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      }));

    const r = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ role, endpoint: sub.endpoint, subscription: sub.toJSON() }),
    });
    return r.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

/** Fire-and-forget: notify the partner's devices about an activity. */
export function notifyPartner(type: "moment" | "quiz", toRole: "A" | "B"): void {
  void fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, toRole }),
  }).catch(() => { /* best effort */ });
}
