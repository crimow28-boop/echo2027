import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const MODEL = "gemini-2.5-flash";

// Builds a short, client-facing summary of a call out of its stored transcript.
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

    if (!body?.force && recording.summary) {
      return Response.json({ success: true, summary: recording.summary });
    }

    const transcript = Array.isArray(recording.transcript) ? recording.transcript : [];
    if (!transcript.length) return Response.json({ success: false, error: 'אין תמלול לשיחה — יש לתמלל קודם' });

    const conversation = transcript
      .map((s) => `${s.speaker === 'agent' ? 'נציג' : 'לקוח'}: ${s.text}`)
      .join('\n');

    const businessName = user.full_name || 'העסק';
    const prompt = [
      'לפניך תמלול שיחת טלפון בין נציג עסק לבין לקוח.',
      'כתוב סיכום קצר בעברית שיישלח ללקוח בוואטסאפ.',
      'מבנה ההודעה:',
      'שורת פתיחה קצרה ("שלום, להלן סיכום שיחתנו:"),',
      'אחריה 3-5 נקודות מפתח קצרות בשורות נפרדות שמתחילות ב-• ,',
      'ואם הוסכמו משימות או המשך טיפול — שורה נפרדת בסוף שמפרטת אותם.',
      `חתום בסוף: "בברכה, ${businessName}".`,
      'אל תמציא פרטים שלא נאמרו בשיחה. החזר טקסט בלבד, בלי כותרות מיותרות ובלי סימני עיצוב כמו כוכביות.',
      '',
      'תמלול השיחה:',
      conversation
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
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    );

    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('gemini summary error', JSON.stringify(data).slice(0, 500));
      return Response.json({ success: false, error: 'הפקת הסיכום נכשלה — נסו שוב' });
    }

    const summary = (data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '').trim();
    if (!summary) return Response.json({ success: false, error: 'לא הצלחנו להפיק סיכום לשיחה' });

    await base44.entities.CallRecording.update(recordId, { summary });

    return Response.json({ success: true, summary });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}