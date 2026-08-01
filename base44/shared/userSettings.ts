import { decryptSettingsRow } from "./secretsBox.ts";

// Shared helpers for per-user integration credentials (UserSettings entity).
// UserSettings has owner-only RLS, so the user-authenticated client only ever
// returns the calling user's own record.

// Fetch the credentials configured for the calling user, or null if not set up yet.
// Configs are created centrally by an admin and linked to a client either by
// ownerUserId or by the client's login email.
export async function getUserSettings(base44) {
  const user = await base44.auth.me();
  if (!user) return null;
  const svc = base44.asServiceRole.entities.UserSettings;
  const queries = [
    { ownerUserId: user.id },
    ...(user.email ? [{ clientEmail: user.email }] : []),
    { created_by_id: user.id }
  ];
  for (const q of queries) {
    const rows = await svc.filter(q, "-updated_date", 10);
    if (rows && rows.length > 0) {
      // Prefer a record that actually holds WhatsApp credentials.
      return decryptSettingsRow(rows.find((r) => r.greenInstanceId && r.greenToken) || rows[0]);
    }
  }
  return null;
}

// Fetch the settings record belonging to an arbitrary user id (service role).
// Used by public endpoints (e.g. listenRecording) that act on behalf of the
// recording's owner without an authenticated session.
export async function getSettingsForUserId(base44, userId) {
  if (!userId) return null;
  const svc = base44.asServiceRole.entities.UserSettings;
  let rows = await svc.filter({ ownerUserId: userId }, "-updated_date", 5);
  if (!rows?.length) rows = await svc.filter({ created_by_id: userId }, "-updated_date", 5);
  if (!rows?.length) {
    try {
      const owner = await base44.asServiceRole.entities.User.get(userId);
      if (owner?.email) rows = await svc.filter({ clientEmail: owner.email }, "-updated_date", 5);
    } catch (_e) {
      // user lookup failed — treat as not found
    }
  }
  return decryptSettingsRow(rows?.[0] || null);
}

// Build a Green API endpoint URL from the user's instance id + api token.
// Green API host is derived from the first 4 digits of the instance id,
// e.g. instance "710722692595" -> "https://7107.api.greenapi.com".
// Returns null if instance id or token are missing.
export function greenApiUrl(settings, method) {
  const id = String(settings?.greenInstanceId || "").trim();
  const token = String(settings?.greenToken || "").trim();
  if (!id || !token) return null;
  const host = `https://${id.slice(0, 4)}.api.green-api.com`;
  return `${host}/waInstance${id}/${method}/${token}`;
}