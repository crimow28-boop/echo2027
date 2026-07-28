import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const GREEN_API_URL = "https://7107.api.greenapi.com/waInstance710722692595/sendFileByUrl/48e0edeb455248518fdf9bd95850167cdc284422809b4e9e87";

// Convert an Israeli phone number to WhatsApp chat id format.
// 0526331295 -> 972526331295 ; strips dashes/spaces ; removes leading 0 ; prepends 972.
function toWhatsAppChatId(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[\s\-+()]/g, "");
  let normalized = cleaned;
  if (normalized.startsWith("972")) {
    // already international, drop leading 0 after country code if present
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

    const recordingUrl = recording.recordingUrl;
    const chatId = toWhatsAppChatId(recording.callerNumber);
    if (!recordingUrl) return Response.json({ error: 'Missing recordingUrl' }, { status: 400 });
    if (!chatId) return Response.json({ error: 'Missing callerNumber' }, { status: 400 });

    const waResponse = await fetch(GREEN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlFile: recordingUrl,
        fileName: "recording.mp3",
        chatId: chatId,
        caption: "📞 הקלטת שיחה מתדהר"
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