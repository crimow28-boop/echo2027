import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getUserSettings } from "../../shared/userSettings.ts";
import { fetchWhatsAppName } from "../../shared/whatsappContacts.ts";

// Fill in missing contact names on the user's recordings using the WhatsApp
// profile name from Green API getContactInfo. One lookup per unique number.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await getUserSettings(base44);
    if (!settings?.greenInstanceId || !settings?.greenToken) {
      return Response.json({ error: 'NO_GREEN_API' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body?.numbers) ? body.numbers.map(String) : null;

    const rows = requested?.length
      ? await base44.entities.CallRecording.filter({ callerNumber: { $in: requested } }, "-callDate", 500)
      : await base44.entities.CallRecording.filter({}, "-callDate", 2000);
    const numbers = [];
    const byNumber = new Map();
    for (const r of rows || []) {
      const number = String(r.callerNumber || "").trim();
      if (!number) continue;
      const name = String(r.callerFriendly || "").trim();
      // A real name contains letters; digit-only values are just the phone number.
      if (/\p{L}/u.test(name)) continue;
      if (!byNumber.has(number)) {
        byNumber.set(number, []);
        numbers.push(number);
      }
      byNumber.get(number).push(r.id);
    }

    const MAX_LOOKUPS = 25;
    const targets = numbers.slice(0, MAX_LOOKUPS);
    const toUpdate = [];
    let found = 0;

    for (const number of targets) {
      const name = await fetchWhatsAppName(settings, number).catch(() => null);
      if (!name) continue;
      found++;
      for (const id of byNumber.get(number)) toUpdate.push({ id, callerFriendly: name });
    }

    if (toUpdate.length) await base44.entities.CallRecording.bulkUpdate(toUpdate);

    return Response.json({
      success: true,
      checked: targets.length,
      found,
      updated: toUpdate.length,
      remaining: Math.max(0, numbers.length - targets.length)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}