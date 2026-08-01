import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { decryptSettingsRow } from "../../shared/secretsBox.ts";

// Verify the calling user's Green API credentials by calling getSettings.
// Returns { valid: true } or { valid: false, error } (HTTP 200 either way).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    let id = String(body?.instanceId || "").trim();
    let token = String(body?.apiToken || "").trim();
    // Admin mode: validate stored (encrypted) credentials by config id.
    if ((!id || !token) && body?.configId && user.role === 'admin') {
      const config = await decryptSettingsRow(await base44.asServiceRole.entities.UserSettings.get(body.configId));
      id = String(config?.greenInstanceId || "").trim();
      token = String(config?.greenToken || "").trim();
    }
    const url = greenApiUrl({ greenInstanceId: id, greenToken: token }, "getStateInstance");
    if (!url) return Response.json({ valid: false, error: 'נדרשים מזהה מופע וטוקן API' });

    const res = await fetch(url);
    let data = {};
    try { data = await res.json(); } catch (_e) {}
    if (!res.ok) {
      return Response.json({ valid: false, error: data?.message || 'פרטי Green API לא תקינים — ודאו את המזהה והטוקן' });
    }
    if (data.stateInstance !== "authorized") {
      return Response.json({ valid: false, error: `מופע Green API אינו מחובר (${data.stateInstance || "לא ידוע"})` });
    }
    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
}