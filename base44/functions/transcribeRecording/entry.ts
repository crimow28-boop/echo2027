import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const MODEL = "gemini-2.5-flash";

function toBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Transcribes a call recording with Google Gemini and stores the diarized
// segments on the CallRecording record.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'נדרשת התחברות' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recordId = body?.recordId;
    if (!recordId) return Response.json({ success: false, error: 'חסר מזהה שיחה' });

    const recording = await base44.entities.CallRecording.get(recordId);
    if (!recording) return Response.json({ success: false, error: 'השיחה לא נמצאה' });

    if (!body?.force && Array.isArray(recording.transcript) && recording.transcript.length) {
      return Response.json({ success: true, transcript: recording.transcript });
    }

    // Reuse the existing short-lived playable URL logic.
    const urlRes = await base44.functions.invoke('getRecordingUrl', { recordId });
    const audioUrl = urlRes?.data?.url;
    if (!audioUrl) {
      return Response.json({ success: false, error: urlRes?.data?.error || 'לא נמצאה הקלטה לשיחה' });
    }

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return Response.json({ success: false, error: 'הורדת ההקלטה נכשלה' });
    const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
    const mimeType = audioRes.headers.get('content-type')?.split(';')[0] || 'audio/mpeg';

    const prompt = [
      'תמלל את שיחת הטלפון המוקלטת בעברית, ברמת דיוק גבוהה.',
      'חלק את התמלול לקטעים לפי דובר, לפי סדר הדיבור.',
      'הדובר מטעם העסק (הנציג שענה או שהתקשר) הוא "agent", והצד השני הוא "client".',
      'החזר JSON בלבד במבנה: {"segments":[{"speaker":"agent|client","text":"..."}]}'
    ].join('\n');

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': secrets.get('GEMINI_API_KEY')
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: toBase64(audioBytes) } }
            ]
          }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0 }
        })
      }
    );

    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('gemini error', JSON.stringify(data).slice(0, 500));
      return Response.json({ success: false, error: 'התמלול נכשל — נסו שוב' });
    }

    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch (_e) { parsed = {}; }
    const transcript = (parsed.segments || [])
      .map((s) => ({
        speaker: s.speaker === 'agent' ? 'agent' : 'client',
        text: String(s.text || '').trim()
      }))
      .filter((s) => s.text);

    if (!transcript.length) return Response.json({ success: false, error: 'לא זוהה דיבור בהקלטה' });

    await base44.entities.CallRecording.update(recordId, {
      transcript,
      transcribedAt: new Date().toISOString()
    });

    return Response.json({ success: true, transcript });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}