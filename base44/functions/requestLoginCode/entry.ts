import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { codeSendBlocked, findClientByPhone, generateCode, normalizePhone } from "../../shared/clientLogin.ts";

// Public endpoint: given an account number + phone, send a one-time login code
// over WhatsApp (Green API) to that phone. Never reveals whether the pair exists
// beyond a generic error.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const config = await findClientByPhone(base44, body?.phone);
    if (!config) {
      return Response.json({ success: false, notRegistered: true, error: 'המספר אינו רשום במערכת' });
    }

    const url = greenApiUrl(config, "sendMessage");
    if (!url) {
      return Response.json({ success: false, error: 'החיבור לוואטסאפ אינו מוגדר — פנו למנהל המערכת' });
    }

    const phone = normalizePhone(config.clientPhone);
    const blocked = await codeSendBlocked(base44, phone);
    if (blocked) {
      return Response.json({ success: false, error: blocked });
    }

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
    if (!res.ok) {
      return Response.json({ success: false, error: 'שליחת הקוד נכשלה — פנו למנהל המערכת' });
    }

    await base44.asServiceRole.entities.LoginCode.create({
      accountNumber: String(config.accountNumber || "").trim() || phone,
      phone,
      code,
      expiresAt,
      used: false
    });

    return Response.json({ success: true, phoneHint: phone.slice(-4) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}