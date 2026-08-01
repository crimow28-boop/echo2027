import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getUserSettings } from "../../shared/userSettings.ts";

// Transcribes a call recording into a speaker-separated chat transcript (Gemini).
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
    if (!settings.transcriptEnabled) return Response.json({ error: 'NOT_ENABLED' }, { status: 403 });

    const recording = await base44.entities.CallRecording.get(recordId);
    if (!recording) return Response.json({ error: 'Recording not found' }, { status: 404 });

    let url = recording.recordingUrl;
    if (recording.externalId) {
      const urls = await getRecordingUrls(settings.exmToken, [recording.externalId], 10);
      const found = urls.find((u) => u.id === recording.externalId && u.code === 0);
      if (found && found.url) url = found.url;
    }
    if (!url) return Response.json({ error: 'מערכת הטלפוניה לא שמרה הקלטה לשיחה הזו' }, { status: 400 });

    // Step 1 — accurate speech-to-text (Whisper).
    const rawText = await base44.integrations.Core.TranscribeAudio({ audio_url: url });
    const text = String(rawText || '').trim();
    if (!text) return Response.json({ error: 'לא זוהה דיבור בהקלטה' }, { status: 400 });

    // Step 2 — split the verbatim transcript between the two speakers.
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: [
        'לפניך תמלול מדויק (verbatim) של שיחת טלפון. חלק אותו לתורות דיבור בין שני דוברים בלבד.',
        '"business" = הצד שענה לשיחה (נציג העסק), "caller" = הצד שהתקשר (הלקוח).',
        'חוק קריטי: אסור לשנות, לתקן, לקצר, לתרגם או להוסיף מילים. השתמש רק במילים שמופיעות בתמלול, באותו סדר בדיוק.',
        'אם לא ברור מי הדובר, שייך את הקטע לדובר הסביר לפי ההקשר, אבל אל תמציא תוכן.',
        '',
        'התמלול:',
        text
      ].join('\n'),
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                speaker: { type: 'string', enum: ['caller', 'business'] },
                text: { type: 'string' }
              },
              required: ['speaker', 'text']
            }
          }
        },
        required: ['messages']
      }
    });

    const messages = (result?.messages || []).filter((m) => m?.text);
    if (messages.length === 0) return Response.json({ error: 'לא זוהה דיבור בהקלטה' }, { status: 400 });

    await base44.entities.CallRecording.update(recordId, {
      transcript: messages,
      transcribedAt: new Date().toISOString()
    });

    return Response.json({ success: true, transcript: messages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}