import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";
import { getRecordingUrls } from "../../shared/exmApi.ts";

const GREEN_API_URL = "https://7107.api.greenapi.com/waInstance710722692595/sendFileByUrl/48e0edeb455248518fdf9bd95850167cdc284422809b4e9e87";
const GREEN_API_SEND_MESSAGE_URL = "https://7107.api.greenapi.com/waInstance710722692595/sendMessage/48e0edeb455248518fdf9bd95850167cdc284422809b4e9e87";

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

    const recording = await base44.entities.CallRecording.get(recordId);
    if (!recording) return Response.json({ error: 'Recording not found' }, { status: 404 });

    const chatId = toWhatsAppChatId(recording.callerNumber);
    if (!chatId) return Response.json({ error: 'Missing callerNumber' }, { status: 400 });

    // Fetch a fresh signed recording URL from exm.co.il (valid 10 min) at send time,
    // so we never rely on a stored URL that may have expired.
    let recordingUrl = recording.recordingUrl;
    if (recording.externalId) {
      const token = secrets.get("EXM_API_TOKEN");
      if (token) {
        const urls = await getRecordingUrls(token, [recording.externalId], 10);
        const found = urls.find((u) => u.id === recording.externalId && u.code === 0);
        if (found && found.url) recordingUrl = found.url;
      }
    }
    if (!recordingUrl) return Response.json({ error: 'No recording available for this call' }, { status: 400 });

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
      `שלום ${clientName},`,
      ``,
      `בהמשך לבקשתך, מצורפת הקלטת השיחה שהתקיימה עם נציג/ת ${businessName}.`,
      ``,
      `📅 תאריך השיחה: ${dateStr}`,
      `🕒 שעת השיחה: ${timeStr}`,
      `⏱️ משך השיחה: ${durationStr}`,
      `📞 מספר הטלפון: ${maskedPhone}`,
      ``,
      `ההקלטה נמסרת לך ללא תשלום. מומלץ לשמור את הקובץ לצורך עיון עתידי.`,
      ``,
      `לכל שאלה או בקשה נוספת, ניתן להשיב להודעה זו.`,
      ``,
      `בברכה,`,
      `${businessName}`
    ].join("\n");

    // Send the template as a dedicated text message first.
    const msgResponse = await fetch(GREEN_API_SEND_MESSAGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chatId, message: caption })
    });
    if (!msgResponse.ok) {
      const errText = await msgResponse.text();
      return Response.json({ error: `Green API message error: ${msgResponse.status} ${errText}` }, { status: 502 });
    }

    // Then send the recording file separately.
    const waResponse = await fetch(GREEN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlFile: recordingUrl,
        fileName: "recording.mp3",
        chatId: chatId
      })
    });

    if (!waResponse.ok) {
      const errText = await waResponse.text();
      return Response.json({ error: `Green API error: ${waResponse.status} ${errText}` }, { status: 502 });
    }

    await base44.entities.CallRecording.update(recordId, { sent: true });

    return Response.json({ success: true, sentTo: chatId.replace("@c.us", "") });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}