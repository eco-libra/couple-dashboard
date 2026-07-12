// Deletes the signed-in user's account: profile row, orphaned couple (with
// cascaded data), and the auth user. Verifies the caller by their JWT.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  const jwt = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return res.status(401).json({ error: "unauthorized" });

  // Identify the caller from their own token.
  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${jwt}` },
  });
  if (!who.ok) return res.status(401).json({ error: "unauthorized" });
  const user = await who.json();
  const userId: string = user?.id;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const admin = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  // Find the couple before removing the profile.
  const profRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=couple_id`,
    { headers: admin },
  );
  const profs = profRes.ok ? await profRes.json() : [];
  const coupleId: string | null = profs[0]?.couple_id ?? null;

  await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
    method: "DELETE", headers: admin,
  });

  // If the couple has no members left, delete it (cascades all couple data).
  if (coupleId) {
    const membersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?couple_id=eq.${coupleId}&select=user_id`,
      { headers: admin },
    );
    const members = membersRes.ok ? await membersRes.json() : [];
    if (members.length === 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/couples?id=eq.${coupleId}`, {
        method: "DELETE", headers: admin,
      });
    }
  }

  // Finally remove the auth user.
  const del = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE", headers: admin,
  });
  if (!del.ok) return res.status(502).json({ error: "delete_failed" });

  return res.status(200).json({ deleted: true });
}
