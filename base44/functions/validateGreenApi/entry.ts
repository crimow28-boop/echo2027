import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Verify the calling user's Green API credentials by calling getSettings.
// Returns { valid: true } or { valid: false, error } (HTTP 200 either way).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = String(body?.instanceId || "").trim();
    const token = String(body?.apiToken || "").trim();
    if (!id || !token) return Response.json({ valid: false, error: 'נדרשים מזהה מופע וטוקן API' });

    const url = `https://${id.slice(0, 4)}.api.greenapi.com/waInstance${id}/getSettings/${token}`;
    const res = await fetch(url);
    let data = {};
    try { data = await res.json(); } catch (_e) {}
    if (!res.ok || data.state === undefined) {
      return Response.json({ valid: false, error: data?.message || 'פרטי Green API לא תקינים — ודאו את המזהה והטוקן' });
    }
    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
}