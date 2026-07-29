import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { normalizePhone } from "../../shared/clientLogin.ts";

// Admin-only: sends the Echo welcome WhatsApp message to a newly configured client.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const configId = body?.configId;
    const loginUrl = body?.loginUrl;
    if (!configId) return Response.json({ success: false, error: 'MISSING_CONFIG_ID' });

    const config = await base44.asServiceRole.entities.UserSettings.get(configId);
    if (!config) return Response.json({ success: false, error: 'CONFIG_NOT_FOUND' });

    const url = greenApiUrl(config, "sendMessage");
    const phone = normalizePhone(config.clientPhone);
    if (!url || !phone) return Response.json({ success: false, error: 'NO_GREEN_API' });

    const message =
      `איזה כיף, ההרשמה שלך ל־Echo הושלמה! 🎉\n\n` +
      `מעכשיו כל הקלטות השיחות של העסק שלך מרוכזות במקום אחד — מוכנות לחיפוש, האזנה ושליחה ללקוחות בוואטסאפ.\n\n` +
      `מספר החשבון שלך ב־Echo: ${config.accountNumber || "—"}\n\n` +
      `מספר החשבון ישמש אותך לצורך התחברות למערכת דרך המחשב והאפליקציה.\n\n` +
      `להתחברות למערכת:\n${loginUrl || ""}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: `${phone}@c.us`, message })
    });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ success: false, error: `WHATSAPP_FAILED: ${text}` });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}