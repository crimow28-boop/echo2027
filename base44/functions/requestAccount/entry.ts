import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { greenApiUrl } from "../../shared/userSettings.ts";
import { normalizePhone } from "../../shared/clientLogin.ts";

// Notify the system admin over WhatsApp about a new account request.
async function notifyAdmin(base44, details) {
  const rawPhone = Deno.env.get("ADMIN_ALERT_PHONE");
  const adminPhone = normalizePhone(rawPhone);
  if (!adminPhone) return { error: "no admin phone", rawPhone };

  const rows = await base44.asServiceRole.entities.UserSettings.filter({}, "-updated_date", 20);
  const creds = (rows || []).find((r) => r.greenInstanceId && r.greenToken);
  const url = creds && greenApiUrl(creds, "sendMessage");
  if (!url) return { error: "no green creds" };

  const message = [
    "🔔 בקשה חדשה לפתיחת חשבון",
    `עסק: ${details.businessName}`,
    `איש קשר: ${details.contactName}`,
    `טלפון: ${details.phone}`,
    details.notes ? `הערות: ${details.notes}` : null
  ].filter(Boolean).join("\n");

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: `${adminPhone}@c.us`, message })
  });
  return { status: res.status, to: adminPhone };
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

    let debug = null;
    try {
      debug = await notifyAdmin(base44, { businessName, contactName, phone, notes });
    } catch (e) { debug = { error: e?.message }; }

    return Response.json({ success: true, debug });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}