import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { listCalls } from "../../shared/exmApi.ts";
import { decryptSettingsRow } from "../../shared/secretsBox.ts";

// Verify the calling user's EXM API token with a minimal call (1 item).
// Returns { valid: true } or { valid: false, error } (HTTP 200 either way),
// so the client can read the result without distinguishing status codes.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    let token = String(body?.token || "").trim();
    // Admin mode: validate a stored (encrypted) token by config id, without the
    // plaintext ever reaching the browser.
    if (!token && body?.configId && user.role === 'admin') {
      const config = await decryptSettingsRow(await base44.asServiceRole.entities.UserSettings.get(body.configId));
      token = String(config?.exmToken || "").trim();
    }
    if (!token) return Response.json({ valid: false, error: 'נדרש טוקן EXM' });

    try {
      await listCalls(token, { items: 1 });
      return Response.json({ valid: true });
    } catch (e) {
      return Response.json({ valid: false, error: 'הטוקן לא תקין — ודאו שהעתקתם אותו נכון מ-EXM' });
    }
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
}