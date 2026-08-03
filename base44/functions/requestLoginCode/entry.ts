import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { codeSendBlocked, findClientByPhone, generateCode, normalizePhone } from "../../shared/clientLogin.ts";

// Public endpoint: given a phone, send a one-time login code over WhatsApp
// (Green API) to that phone. The response is identical whether or not the number
// is registered, so the endpoint can't be used to enumerate customers.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const requested = normalizePhone(body?.phone);
    if (!requested) {
      return Response.json({ success: false, error: 'מספר טלפון חסר' });
    }
    // The login screen has no separate signup flow: an unregistered number is
    // routed straight into the signup steps, so we report that back.
    const config = await findClientByPhone(base44, requested);
    if (!config) return Response.json({ success: true, registered: false });

    const blocked = await codeSendBlocked(base44, requested);
    if (blocked) return Response.json({ success: false, error: blocked });

    const url = greenApiUrl(config, "sendMessage");
    if (!url) return Response.json({ success: false, error: 'החיבור לוואטסאפ אינו מוגדר — פנו למנהל המערכת' });

    const phone = normalizePhone(config.clientPhone);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        message: `קוד ההתחברות שלך: ${code}\nהקוד בתוקף ל-5 דקות.`
      })
    });
    if (!res.ok) return Response.json({ success: false, error: 'שליחת הקוד נכשלה — נסו שוב' });

    await base44.asServiceRole.entities.LoginCode.create({
      accountNumber: String(config.accountNumber || "").trim() || phone,
      phone,
      code,
      expiresAt,
      used: false
    });

    return Response.json({ success: true, registered: true, phoneHint: phone.slice(-4) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}