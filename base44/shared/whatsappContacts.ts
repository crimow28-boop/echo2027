// Shared WhatsApp (Green API) contact helpers.
import { greenApiUrl } from "./userSettings.ts";

// Convert an Israeli phone number to WhatsApp chat id format.
// 0526331295 -> 972526331295@c.us
export function toWhatsAppChatId(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[\s\-+()]/g, "");
  let normalized = cleaned;
  if (normalized.startsWith("972")) {
    normalized = normalized.replace(/^9720?/, "972");
  } else if (normalized.startsWith("0")) {
    normalized = "972" + normalized.slice(1);
  }
  return `${normalized}@c.us`;
}

// Look up the WhatsApp profile name for a phone number via Green API getContactInfo.
// Returns a trimmed name, or null when unavailable.
export async function fetchWhatsAppName(settings, phone) {
  const url = greenApiUrl(settings, "getContactInfo");
  const chatId = toWhatsAppChatId(phone);
  if (!url || !chatId) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId })
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const name = data?.contactName || data?.name || data?.pushname || "";
  return String(name).trim() || null;
}