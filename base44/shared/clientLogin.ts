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
  return (rows || []).find((r) => normalizePhone(r.clientPhone) === wanted && wanted) || null;
}

// Find the client config matching a phone number alone (service role).
export async function findClientByPhone(base44, phone) {
  const wanted = normalizePhone(phone);
  if (!wanted) return null;
  const rows = await base44.asServiceRole.entities.UserSettings.list("-updated_date", 500);
  return (rows || []).find((r) => normalizePhone(r.clientPhone) === wanted) || null;
}

export function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}