// Echo's OWN Green API instance — used for system messages (signup codes, lead
// alerts, welcome messages). Never borrow a customer's WhatsApp credentials for
// these: it exposes their business number to strangers and risks a ban.

export function toChatId(phone: string) {
  const p = String(phone || "").replace(/\D/g, "");
  if (!p) return "";
  if (p.startsWith("972")) return `${p}@c.us`;
  if (p.startsWith("0")) return `972${p.slice(1)}@c.us`;
  return `${p}@c.us`;
}

// Returns { ok, skipped? } — never throws on missing configuration.
export async function sendSystemWhatsApp(phone: string, message: string) {
  const instanceId = Deno.env.get("GREEN_SYSTEM_INSTANCE_ID");
  const token = Deno.env.get("GREEN_SYSTEM_TOKEN");
  if (!instanceId || !token) return { ok: false, skipped: "system whatsapp not configured" };

  const chatId = toChatId(phone);
  if (!chatId) return { ok: false, skipped: "no phone" };

  const res = await fetch(
    `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message })
    }
  );
  return { ok: res.ok, status: res.status };
}