import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { normalizePhone } from "../../shared/clientLogin.ts";
import { sendSystemWhatsApp } from "../../shared/systemWhatsApp.ts";

const MAX_ATTEMPTS = 5;

// Verify the WhatsApp code that was sent to the signing-up phone number.
// Wrong guesses are counted and the code is burned after 5 failures, so the
// 6-digit code can't be brute-forced.
async function verifySignupCode(base44, phone, code) {
  const normalized = normalizePhone(phone);
  const clean = String(code || "").replace(/\D/g, "");
  if (!normalized || clean.length !== 6) return false;

  const rows = await base44.asServiceRole.entities.LoginCode.filter(
    { accountNumber: `signup:${normalized}`, used: false },
    "-created_date",
    1
  );
  const record = rows?.[0];
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) return false;

  if (record.code !== clean) {
    const attempts = (record.attempts || 0) + 1;
    await base44.asServiceRole.entities.LoginCode.update(record.id, {
      attempts,
      ...(attempts >= MAX_ATTEMPTS ? { used: true } : {})
    });
    return false;
  }

  await base44.asServiceRole.entities.LoginCode.update(record.id, { used: true });
  return true;
}

// Notify the system admins by email about a new account request.
async function notifyAdmin(base44, details) {
  const users = await base44.asServiceRole.entities.User.filter({ role: "admin" });
  const emails = (users || []).map((u) => u.email).filter(Boolean);
  if (emails.length === 0) return { error: "no admin email" };

  const body = [
    "בקשה חדשה לפתיחת חשבון ב-echo",
    "",
    details.businessName ? `עסק: ${details.businessName}` : null,
    `ח.פ: ${details.businessId}`,
    `איש קשר: ${details.contactName}`,
    `טלפון: ${details.phone}`,
    details.notes ? `הערות: ${details.notes}` : null
  ].filter(Boolean).join("\n");

  for (const to of emails) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `בקשה חדשה לפתיחת חשבון — ${details.businessName || details.businessId}`,
      body,
      from_name: "echo"
    });
  }
  return { sent: emails.length };
}

// Notify the system admin on WhatsApp about a new lead — from Echo's own
// WhatsApp instance, never from a customer's account.
async function notifyAdminWhatsApp(details) {
  const target = Deno.env.get("ADMIN_ALERT_PHONE");
  if (!target) return { skipped: "no ADMIN_ALERT_PHONE" };

  const message = [
    "🔔 ליד חדש ב-echo",
    "",
    details.businessName ? `עסק: ${details.businessName}` : null,
    `ח.פ: ${details.businessId}`,
    `איש קשר: ${details.contactName}`,
    `טלפון: ${details.phone}`,
    details.notes ? `הערות: ${details.notes}` : null
  ].filter(Boolean).join("\n");

  return sendSystemWhatsApp(target, message);
}

// Immediate WhatsApp welcome to the person who just requested an account.
async function notifyLeadWhatsApp(details) {
  const message =
    `היי ${details.contactName}, ברוכים הבאים ל־Echo 👋\n\n` +
    `החשבון שלך נפתח בהצלחה.\n\n` +
    `כדי להשלים את ההגדרה ולחבר את הקלטות השיחות, נציג שלנו יצור איתך קשר בקרוב וילווה אותך בתהליך.\n\n` +
    `בינתיים אין צורך לעשות דבר - אנחנו נדאג להכול יחד איתך.`;

  return sendSystemWhatsApp(details.phone, message);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const businessName = (body.businessName || "").trim();
    const businessId = (body.businessId || "").trim();
    const contactName = (body.contactName || "").trim();
    const phone = (body.phone || "").trim();
    const notes = (body.notes || "").trim();

    if (!contactName || !phone) {
      return Response.json({ success: false, error: "יש למלא שם מלא וטלפון" }, { status: 400 });
    }

    const verified = await verifySignupCode(base44, phone, body.code);
    if (!verified) {
      return Response.json({ success: false, error: "קוד האימות שגוי או שפג תוקפו" }, { status: 400 });
    }

    await base44.asServiceRole.entities.AccountRequest.create({
      businessName,
      businessId,
      contactName,
      phone,
      notes,
      handled: false
    });

    try {
      await notifyAdmin(base44, { businessName, businessId, contactName, phone, notes });
    } catch (_e) { /* request is saved even if the email fails */ }

    try {
      await notifyAdminWhatsApp({ businessName, businessId, contactName, phone, notes });
    } catch (_e) { /* request is saved even if the WhatsApp alert fails */ }

    try {
      await notifyLeadWhatsApp({ contactName, phone });
    } catch (_e) { /* request is saved even if the welcome message fails */ }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}