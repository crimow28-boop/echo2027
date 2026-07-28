import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getUserSettings, greenApiUrl } from "../../shared/userSettings.ts";

// Convert an Israeli phone number to WhatsApp chat id format.
// 0526331295 -> 972526331295 ; strips dashes/spaces ; removes leading 0 ; prepends 972.
function toWhatsAppChatId(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[\s\-+()]/g, "");
  let normalized = cleaned;
  if (normalized.startsWith("972")) {
    normalized = normalized.replace(/^9720?/, "972");
  } else if (normalized.startsWith("0")) {
    normalized = "972" + normalized.slice(1);
  }
  return `${normalized}@c.us`;
}

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

    // Fetch a permanent public recording URL from exm.co.il (ttl=0, no time limit)
    // using the calling user's own EXM token, so the client can open the link anytime.
    let recordingUrl = recording.recordingUrl;
    if (recording.externalId) {
      const urls = await getRecordingUrls(settings.exmToken, [recording.externalId], 0);
      const found = urls.find((u) => u.id === recording.externalId && u.code === 0);
      if (found && found.url) recordingUrl = found.url;
    }
    if (!recordingUrl) return Response.json({ error: 'No recording available for this call' }, { status: 400 });

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

    const caption = [
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
    if (!msgResponse.ok) {
      const errText = await msgResponse.text();
      return Response.json({ error: `Green API message error: ${msgResponse.status} ${errText}` }, { status: 502 });
    }

    await base44.entities.CallRecording.update(recordId, { sent: true });

    return Response.json({ success: true, sentTo: chatId.replace("@c.us", "") });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}