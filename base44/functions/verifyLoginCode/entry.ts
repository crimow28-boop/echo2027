import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findClientByPhone, normalizePhone } from "../../shared/clientLogin.ts";

// Public endpoint: verify the WhatsApp one-time code and hand back the hidden
// platform credentials so the browser can complete the login.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || "").trim();
    const config = await findClientByPhone(base44, body?.phone);
    if (!config || !code) {
      return Response.json({ success: false, error: 'הקוד שהוזן אינו תקין' });
    }

    const rows = await base44.asServiceRole.entities.LoginCode.filter(
      { phone: normalizePhone(config.clientPhone), code, used: false },
      "-created_date",
      1
    );
    const record = rows?.[0];
    if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
      return Response.json({ success: false, error: 'הקוד שהוזן אינו תקין או שפג תוקפו' });
    }

    await base44.asServiceRole.entities.LoginCode.update(record.id, { used: true });

    if (!config.clientEmail || !config.loginPassword) {
      return Response.json({ success: false, error: 'חשבון ההתחברות לא הוקם — פנו למנהל המערכת' });
    }

    return Response.json({ success: true, email: config.clientEmail, password: config.loginPassword });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}