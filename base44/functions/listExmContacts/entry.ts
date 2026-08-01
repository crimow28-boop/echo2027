import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getUserSettings } from "../../shared/userSettings.ts";
import { listCalls } from "../../shared/exmApi.ts";

// The exm API has no phonebook endpoint, but every call carries the switchboard
// contact (call.contact.name) when the other party is saved there. We read a few
// pages of recent calls straight from the API and build the contact list from them.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'נדרשת התחברות' }, { status: 401 });

    const settings = await getUserSettings(base44);
    const token = String(settings?.exmToken || "").trim();
    if (!token) return Response.json({ success: false, error: 'לא הוגדר טוקן מרכזייה' });

    const byPhone = new Map();
    let next = undefined;

    for (let page = 0; page < 3; page++) {
      const data = await listCalls(token, { items: 200, next });
      for (const call of data.calls || []) {
        const isOutgoing = String(call.type || "").startsWith("outgoing");
        const other = isOutgoing ? call.numbers?.destination : call.numbers?.caller;
        const phone = String(other?.e164 || "").replace(/\D/g, "");
        if (!phone || byPhone.has(phone)) continue;
        const name = call.contact && call.contact.name ? String(call.contact.name).trim() : "";
        byPhone.set(phone, { phone, name });
      }
      next = data.metadata?.next_page_token;
      if (!next) break;
    }

    // Saved contacts (with a real name) first, then the rest of the numbers.
    const contacts = [...byPhone.values()].sort((a, b) => {
      if (!!a.name !== !!b.name) return a.name ? -1 : 1;
      return a.name.localeCompare(b.name, "he");
    });

    return Response.json({ success: true, contacts });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}