import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { codeSendBlocked, generateCode, normalizePhone } from "../../shared/clientLogin.ts";
import { sendSystemWhatsApp } from "../../shared/systemWhatsApp.ts";

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

    // Sent from Echo's own WhatsApp instance — never from a customer's account.
    const code = generateCode();
    const res = await sendSystemWhatsApp(
      phone,
      `קוד האימות לפתיחת חשבון ב-Echo: ${code}\nהקוד בתוקף ל-5 דקות.`
    );
    if (!res.ok) {
      return Response.json({
        success: false,
        error: res.skipped
          ? 'החיבור לוואטסאפ של המערכת אינו מוגדר — פנו למנהל המערכת'
          : 'שליחת הקוד נכשלה — נסו שוב'
      });
    }

    await base44.asServiceRole.entities.LoginCode.create({
      accountNumber: `signup:${phone}`,
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false,
      attempts: 0
    });

    return Response.json({ success: true, phoneHint: phone.slice(-4) });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}