import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";
import { getRecordingUrls } from "../../shared/exmApi.ts";

const GREEN_API_URL = "https://7107.api.greenapi.com/waInstance710722692595/sendFileByUrl/48e0edeb455248518fdf9bd95850167cdc284422809b4e9e87";

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

    const waResponse = await fetch(GREEN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlFile: recordingUrl,
        fileName: "recording.mp3",
        chatId: chatId,
        caption: "📞 הקלטת שיחה"
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