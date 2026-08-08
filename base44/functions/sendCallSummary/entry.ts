import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getUserSettings, greenApiUrl } from "../../shared/userSettings.ts";
import { toWhatsAppChatId } from "../../shared/whatsappContacts.ts";

// Sends the (possibly edited) call summary text to the client over the business's
// own Green API WhatsApp instance.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'נדרשת התחברות' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recordId = body?.recordId;
    const message = String(body?.message || '').trim();
    if (!recordId) return Response.json({ success: false, error: 'חסר מזהה שיחה' });
    if (!message) return Response.json({ success: false, error: 'הסיכום ריק' });

    const recording = await base44.entities.CallRecording.get(recordId);
    if (!recording) return Response.json({ success: false, error: 'השיחה לא נמצאה' });

    const chatId = toWhatsAppChatId(recording.callerNumber);
    if (!chatId) return Response.json({ success: false, error: 'חסר מספר טלפון ללקוח' });

    const settings = await getUserSettings(base44);
    const sendMessageUrl = greenApiUrl(settings, "sendMessage");
    if (!sendMessageUrl) return Response.json({ success: false, error: 'לא הוגדרו פרטי Green API' });

    const res = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || (data && data.error)) {
      const friendly = res.status === 401
        ? 'פרטי Green API שגויים או פגי תוקף — בדקו את המזהה והטוקן בהגדרות'
        : `Green API: ${data?.error || 'HTTP ' + res.status}`;
      return Response.json({ success: false, error: friendly });
    }

    await base44.entities.CallRecording.update(recordId, {
      summary: message,
      summarySentAt: new Date().toISOString()
    });

    return Response.json({ success: true, sentTo: chatId.replace('@c.us', '') });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}