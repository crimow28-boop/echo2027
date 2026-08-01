import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getUserSettings } from "../../shared/userSettings.ts";
import { normalizePhone } from "../../shared/clientLogin.ts";

const BASE = "https://www.exm.co.il/api/v1";

// Click2Call: the exm switchboard rings the client's own phone (leg 1) and once
// answered dials the destination (leg 2), showing the virtual number as caller id.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'נדרשת התחברות' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const destination = normalizePhone(body?.to);
    if (!destination) return Response.json({ success: false, error: 'מספר יעד חסר או שגוי' });

    const settings = await getUserSettings(base44);
    const token = String(settings?.exmToken || "").trim();
    if (!token) return Response.json({ success: false, error: 'לא הוגדר טוקן מרכזייה' });

    const physical = normalizePhone(settings?.clientPhone);
    if (!physical) return Response.json({ success: false, error: 'לא הוגדר מספר הטלפון שלכם בהגדרות' });
    const callerId = normalizePhone(settings?.virtualNumber) || physical;

    const params = new URLSearchParams({
      caller_id: `+${callerId}`,
      physical: `+${physical}`,
      destination: `+${destination}`
    });
    const res = await fetch(`${BASE}/click2call/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    const data = await res.json().catch(() => null);

    if (!data?.success) {
      const first = Array.isArray(data?.errors) ? data.errors[0] : data?.errors || data?.error;
      return Response.json({
        success: false,
        error: first?.description || first?.message || 'החיוג נכשל'
      });
    }
    return Response.json({ success: true, callId: data.call_id, numbers: data.numbers });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}