import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}