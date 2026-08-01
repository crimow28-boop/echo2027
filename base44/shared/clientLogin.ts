import { decryptSettingsRow } from "./secretsBox.ts";

// Helpers for the account-number + phone + WhatsApp code login flow.

// Normalize an Israeli phone number to international digits (e.g. 972501234567).
export function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return "972" + digits.slice(1);
  if (digits.length === 9) return "972" + digits;
  return digits;
}

// Find the client config matching an account number + phone (service role).
export async function findClientConfig(base44, accountNumber, phone) {
  const account = String(accountNumber || "").trim();
  if (!account) return null;
  const rows = await base44.asServiceRole.entities.UserSettings.filter({ accountNumber: account }, "-updated_date", 5);
  const wanted = normalizePhone(phone);
  return decryptSettingsRow((rows || []).find((r) => normalizePhone(r.clientPhone) === wanted && wanted) || null);
}

// Find the client config matching a phone number alone (service role).
export async function findClientByPhone(base44, phone) {
  const wanted = normalizePhone(phone);
  if (!wanted) return null;
  const rows = await base44.asServiceRole.entities.UserSettings.list("-updated_date", 500);
  return decryptSettingsRow((rows || []).find((r) => normalizePhone(r.clientPhone) === wanted) || null);
}

// Cryptographically-random 6-digit code (not Math.random, which is guessable).
export function generateCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

// Throttle code sending per phone: 60s cooldown between codes, max 5 per hour.
// Returns a user-facing error string when blocked, or null when allowed.
export async function codeSendBlocked(base44, phone) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const rows = await base44.asServiceRole.entities.LoginCode.filter(
    { phone, created_date: { $gte: hourAgo } },
    "-created_date",
    10
  );
  if (!rows || rows.length === 0) return null;
  if (Date.now() - new Date(rows[0].created_date).getTime() < 60 * 1000) {
    return "שלחנו קוד ממש עכשיו — אנא המתינו דקה לפני בקשת קוד נוסף";
  }
  if (rows.length >= 5) {
    return "יותר מדי בקשות קוד למספר הזה — נסו שוב בעוד כשעה";
  }
  return null;
}