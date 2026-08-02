import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findClientByPhone, normalizePhone } from "../../shared/clientLogin.ts";

const MAX_ATTEMPTS = 5;

// Public endpoint: verify the WhatsApp one-time code and complete the login on
// the server. Only a session token is returned — credentials never reach the
// browser. Wrong guesses are counted and the code is burned after 5 failures.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || "").trim();
    const config = await findClientByPhone(base44, body?.phone);
    if (!config || !code) {
      return Response.json({ success: false, error: 'הקוד שהוזן אינו תקין' });
    }

    const phone = normalizePhone(config.clientPhone);
    const rows = await base44.asServiceRole.entities.LoginCode.filter(
      { phone, used: false },
      "-created_date",
      1
    );
    const record = rows?.[0];
    if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
      return Response.json({ success: false, error: 'הקוד שהוזן אינו תקין או שפג תוקפו' });
    }

    if (record.code !== code) {
      const attempts = (record.attempts || 0) + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      await base44.asServiceRole.entities.LoginCode.update(record.id, {
        attempts,
        ...(locked ? { used: true } : {})
      });
      return Response.json({
        success: false,
        error: locked ? 'יותר מדי ניסיונות שגויים — בקשו קוד חדש' : 'הקוד שהוזן אינו תקין'
      });
    }

    await base44.asServiceRole.entities.LoginCode.update(record.id, { used: true });

    if (!config.clientEmail || !config.loginPassword) {
      return Response.json({ success: false, error: 'חשבון ההתחברות לא הוקם — פנו למנהל המערכת' });
    }

    // Complete the platform login server-side and hand back only the token.
    const login = await base44.auth.loginViaEmailPassword(config.clientEmail, config.loginPassword);
    if (!login?.access_token) {
      return Response.json({ success: false, error: 'ההתחברות נכשלה — פנו למנהל המערכת' });
    }

    return Response.json({ success: true, token: login.access_token });
  } catch (error) {
    const raw = error?.message;
    const message = typeof raw === "string" ? raw : JSON.stringify(raw ?? error);
    console.error("verifyLoginCode failed:", message);
    return Response.json({ success: false, error: 'ההתחברות נכשלה, נסו שוב' }, { status: 500 });
  }
}