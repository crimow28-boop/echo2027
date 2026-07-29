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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}