import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Notify the system admins by email about a new account request.
async function notifyAdmin(base44, details) {
  const users = await base44.asServiceRole.entities.User.filter({ role: "admin" });
  const emails = (users || []).map((u) => u.email).filter(Boolean);
  if (emails.length === 0) return { error: "no admin email" };

  const body = [
    "בקשה חדשה לפתיחת חשבון ב-echo",
    "",
    `עסק: ${details.businessName}`,
    `איש קשר: ${details.contactName}`,
    `טלפון: ${details.phone}`,
    details.notes ? `הערות: ${details.notes}` : null
  ].filter(Boolean).join("\n");

  for (const to of emails) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `בקשה חדשה לפתיחת חשבון — ${details.businessName}`,
      body,
      from_name: "echo"
    });
  }
  return { sent: emails.length };
}

function toChatId(phone) {
  let p = (phone || "").replace(/\D/g, "");
  if (p.startsWith("972")) return `${p}@c.us`;
  if (p.startsWith("0")) return `972${p.slice(1)}@c.us`;
  return `${p}@c.us`;
}

// Notify the system admin on WhatsApp about a new lead (via Green API).
async function notifyAdminWhatsApp(base44, details) {
  const target = Deno.env.get("ADMIN_ALERT_PHONE");
  if (!target) return { skipped: "no ADMIN_ALERT_PHONE" };

  const rows = await base44.asServiceRole.entities.UserSettings.list("-updated_date", 200);
  const creds = (rows || []).find((r) => r.greenInstanceId && r.greenToken);
  if (!creds) return { skipped: "no green api credentials" };

  const message = [
    "🔔 ליד חדש ב-echo",
    "",
    `עסק: ${details.businessName}`,
    `איש קשר: ${details.contactName}`,
    `טלפון: ${details.phone}`,
    details.notes ? `הערות: ${details.notes}` : null
  ].filter(Boolean).join("\n");

  const res = await fetch(
    `https://api.green-api.com/waInstance${creds.greenInstanceId}/sendMessage/${creds.greenToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: toChatId(target), message })
    }
  );
  return { status: res.status };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const businessName = (body.businessName || "").trim();
    const contactName = (body.contactName || "").trim();
    const phone = (body.phone || "").trim();
    const notes = (body.notes || "").trim();

    if (!businessName || !contactName || !phone) {
      return Response.json({ success: false, error: "יש למלא שם עסק, איש קשר וטלפון" }, { status: 400 });
    }

    await base44.asServiceRole.entities.AccountRequest.create({
      businessName,
      contactName,
      phone,
      notes,
      handled: false
    });

    try {
      await notifyAdmin(base44, { businessName, contactName, phone, notes });
    } catch (_e) { /* request is saved even if the email fails */ }

    try {
      await notifyAdminWhatsApp(base44, { businessName, contactName, phone, notes });
    } catch (_e) { /* request is saved even if the WhatsApp alert fails */ }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}