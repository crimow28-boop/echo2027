import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { codeSendBlocked, generateCode, normalizePhone } from "../../shared/clientLogin.ts";
import { decryptSettingsRow } from "../../shared/secretsBox.ts";

// Public endpoint: send a one-time verification code over WhatsApp to a phone
// that is signing up for a new account (before the account is actually opened).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(body?.phone);
    if (!phone) return Response.json({ success: false, error: 'מספר טלפון חסר' });

    const blocked = await codeSendBlocked(base44, phone);
    if (blocked) return Response.json({ success: false, error: blocked });

    const rows = await base44.asServiceRole.entities.UserSettings.list("-updated_date", 200);
    const creds = await decryptSettingsRow((rows || []).find((r) => r.greenInstanceId && r.greenToken) || null);
    const url = creds ? greenApiUrl(creds, "sendMessage") : null;
    if (!url) return Response.json({ success: false, error: 'החיבור לוואטסאפ אינו מוגדר — פנו למנהל המערכת' });

    const code = generateCode();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        message: `קוד האימות לפתיחת חשבון ב-Echo: ${code}\nהקוד בתוקף ל-5 דקות.`
      })
    });
    if (!res.ok) return Response.json({ success: false, error: 'שליחת הקוד נכשלה — נסו שוב' });

    await base44.asServiceRole.entities.LoginCode.create({
      accountNumber: `signup:${phone}`,
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false
    });

    return Response.json({ success: true, phoneHint: phone.slice(-4) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}