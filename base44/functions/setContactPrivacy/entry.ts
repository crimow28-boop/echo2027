import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Hiding a contact must remove their calls from the server response, not just
// from the UI — so every matching CallRecording is flagged `hidden`, and the
// entity's RLS stops hidden rows from ever being returned to the browser.

function normalize(num: string) {
  let n = String(num || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "972" + n.slice(1);
  return n;
}

// Flip the `hidden` flag on all of the user's recordings for one phone number.
async function applyHidden(base44, userId: string, phone: string, hidden: boolean) {
  const rows = await base44.asServiceRole.entities.CallRecording.filter(
    { created_by_id: userId },
    "-callDate",
    5000
  );
  const updates = (rows || [])
    .filter((r) => normalize(r.callerNumber) === phone && !!r.hidden !== hidden)
    .map((r) => ({ id: r.id, hidden }));
  if (updates.length) await base44.asServiceRole.entities.CallRecording.bulkUpdate(updates);
  return updates.length;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "hide") {
      const phone = normalize(body?.phone);
      if (!phone) return Response.json({ success: false, error: 'מספר טלפון חסר' }, { status: 400 });
      const contact = await base44.entities.PrivateContact.create({
        phone,
        name: String(body?.name || "")
      });
      const affected = await applyHidden(base44, user.id, phone, true);
      return Response.json({ success: true, contact, affected });
    }

    if (action === "unhide") {
      const id = String(body?.contactId || "");
      if (!id) return Response.json({ success: false, error: 'חסר מזהה איש קשר' }, { status: 400 });
      const contact = await base44.entities.PrivateContact.get(id);
      if (!contact) return Response.json({ success: false, error: 'איש הקשר לא נמצא' }, { status: 404 });
      const affected = await applyHidden(base44, user.id, normalize(contact.phone), false);
      await base44.entities.PrivateContact.delete(id);
      return Response.json({ success: true, affected });
    }

    return Response.json({ success: false, error: 'action לא חוקי' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}