import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    // Send the recording link to the client (email reaches registered app users only)
    if (recording.recordingUrl) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `הקלטת שיחה מ-${recording.callerFriendly || recording.callerNumber}`,
        body: `שלום,<br/><br/>הקלטת השיחה מוכנה להאזנה:<br/><a href="${recording.recordingUrl}">${recording.recordingUrl}</a><br/><br/>משך: ${recording.duration} שניות`
      });
    }

    await base44.entities.CallRecording.update(recordId, { sent: true });

    return Response.json({ success: true, sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}