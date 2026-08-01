import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getUserSettings, greenApiUrl } from "../../shared/userSettings.ts";
import { toWhatsAppChatId } from "../../shared/whatsappContacts.ts";
import { randomListenToken, listenUrl } from "../../shared/listenLinks.ts";
import { secrets } from "base44:runtime";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const recordId = body?.recordId;
    if (!recordId) return Response.json({ error: 'recordId is required' }, { status: 400 });

    const settings = await getUserSettings(base44);
    if (!settings?.exmToken) return Response.json({ error: 'NO_SETTINGS' }, { status: 400 });

    const recording = await base44.entities.CallRecording.get(recordId);
    if (!recording) return Response.json({ error: 'Recording not found' }, { status: 404 });

    const chatId = toWhatsAppChatId(recording.callerNumber);
    if (!chatId) return Response.json({ error: 'Missing callerNumber' }, { status: 400 });

    // The client receives an Echo-owned link (listenRecording) that mints a fresh
    // short-lived EXM signed URL on every listen — never a permanent public URL.
    // 0-second calls were never answered: no recording, send a call-back message.
    const missed = !Number(recording.duration);
    let recordingUrl = null;
    let lookupError = null;
    let notRecorded = false;
    if (!missed && recording.externalId) {
      // Verify the recording actually exists in EXM (can be slow — retry once).
      for (let attempt = 0; attempt < 2 && !recordingUrl; attempt++) {
        try {
          const urls = await getRecordingUrls(settings.exmToken, [recording.externalId], 10);
          const found = urls.find((u) => u.id === recording.externalId);
          if (found?.url) {
            let token = recording.listenToken;
            if (!token) {
              token = randomListenToken();
              await base44.entities.CallRecording.update(recordId, { listenToken: token, recordingMissing: false });
            }
            recordingUrl = listenUrl(secrets.get("BASE44_APP_ID"), token);
            lookupError = null;
          } else if (found && found.code === 404) {
            notRecorded = true;
            break;
          } else {
            lookupError = "לא הצלחנו לקבל קישור להקלטה ממערכת הטלפוניה";
          }
        } catch (e) {
          lookupError = `מערכת הטלפוניה לא זמינה כרגע (${e.message})`;
        }
      }
    } else if (!missed && recording.recordingUrl) {
      // Legacy records without an EXM id — fall back to the stored URL.
      recordingUrl = recording.recordingUrl;
    }
    if (!missed && !recordingUrl) {
      if (notRecorded && !recording.recordingMissing) {
        await base44.entities.CallRecording.update(recordId, { recordingMissing: true });
      }
      const error = notRecorded
        ? 'מערכת הטלפוניה לא שמרה קובץ הקלטה לשיחה הזו'
        : (lookupError || 'לא נמצא קישור להקלטה של השיחה הזו');
      return Response.json({ error }, { status: 400 });
    }

    const sendMessageUrl = greenApiUrl(settings, "sendMessage");
    if (!sendMessageUrl) return Response.json({ error: 'NO_GREEN_API' }, { status: 400 });

    // Build the client-facing message from the business template.
    const businessName = user.full_name || "העסק שלנו";
    const clientName = recording.callerFriendly || "לקוח יקר";
    const callDateObj = recording.callDate ? new Date(recording.callDate) : null;
    const dateStr = callDateObj ? callDateObj.toLocaleDateString("he-IL") : "—";
    const timeStr = callDateObj
      ? callDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
      : "—";
    const secs = typeof recording.duration === "number" ? recording.duration : 0;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    const durationStr =
      mins > 0 ? `${mins} דקות ו-${remSecs} שניות` : `${remSecs} שניות`;
    const digits = String(recording.callerNumber || "").replace(/\D/g, "");
    const maskedPhone =
      digits.length >= 5
        ? `${digits.slice(0, 3)}${"*".repeat(digits.length - 5)}${digits.slice(-2)}`
        : digits;

    const missedFallback = recording.callType === "outgoing"
      ? [
          `שלום,`,
          `ניסינו להשיג אותך בטלפון ולא הצלחנו.`,
          `נשמח שתחזור אלינו בהזדמנות הראשונה, או פשוט להשיב להודעה זו.`,
          ``,
          `בברכה,`,
          `${businessName}`
        ].join("\n")
      : [
          `שלום,`,
          `ראינו שהתקשרת ולא הצלחנו לענות.`,
          `נחזור אליך בהקדם — אפשר גם להשיב להודעה זו ונטפל בפנייה.`,
          ``,
          `בברכה,`,
          `${businessName}`
        ].join("\n");

    const customMessage = typeof body?.message === "string" ? body.message.trim() : "";
    const caption = missed
      ? (customMessage || missedFallback)
      : customMessage
      ? (customMessage.includes("{{link}}")
          ? customMessage.replaceAll("{{link}}", recordingUrl)
          : `${customMessage}\n\n${recordingUrl}`)
      : [
      `שלום,`,
      `להלן הקישור להקלטת השיחה שהתקיימה עם נציג/ת ${businessName}:`,
      `${recordingUrl}`,
      ``,
      `📅 תאריך השיחה: ${dateStr}`,
      `🕒 שעת השיחה: ${timeStr}`,
      `⏱️ משך השיחה: ${durationStr}`,
      ``,
      `הקישור נשמר ללא מגבלת זמן — מומלץ לשמור אותו לצורך עיון עתידי.`,
      ``,
      `לכל שאלה או בקשה נוספת, ניתן להשיב להודעה זו.`,
      ``,
      `בברכה,`,
      `${businessName}`
    ].join("\n");

    // Send the template as a dedicated text message via the user's own Green API.
    const msgResponse = await fetch(sendMessageUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chatId, message: caption })
    });
    const msgData = await msgResponse.json().catch(() => null);
    if (!msgResponse.ok || (msgData && msgData.error)) {
      const friendly = msgResponse.status === 401
        ? "פרטי Green API שגויים או פגי תוקף — בדקו את המזהה והטוקן בהגדרות"
        : `Green API: ${msgData?.error || "HTTP " + msgResponse.status}`;
      return Response.json({ error: friendly }, { status: 502 });
    }

    await base44.entities.CallRecording.update(recordId, { sent: true, sentAt: new Date().toISOString() });

    return Response.json({ success: true, sentTo: chatId.replace("@c.us", "") });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}