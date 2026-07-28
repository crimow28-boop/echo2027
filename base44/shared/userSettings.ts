// Shared helpers for per-user integration credentials (UserSettings entity).
// UserSettings has owner-only RLS, so the user-authenticated client only ever
// returns the calling user's own record.

// Fetch the calling user's stored credentials, or null if not configured yet.
export async function getUserSettings(base44) {
  const rows = await base44.entities.UserSettings.filter({}, "-updated_date", 10);
  if (!rows || rows.length === 0) return null;
  // Prefer a record that actually holds WhatsApp credentials, so an older/partial
  // duplicate record never hides a fully configured one.
  return rows.find((r) => r.greenInstanceId && r.greenToken) || rows[0];
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