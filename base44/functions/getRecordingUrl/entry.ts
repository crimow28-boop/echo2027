import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getUserSettings } from "../../shared/userSettings.ts";

// Returns a short-lived playable URL for a recording, for in-app listening.
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

    let url = recording.recordingUrl;
    if (recording.externalId) {
      const urls = await getRecordingUrls(settings.exmToken, [recording.externalId], 10);
      const found = urls.find((u) => u.id === recording.externalId && u.code === 0);
      if (found && found.url) url = found.url;
    }
    if (!url) return Response.json({ error: 'אין הקלטה זמינה לשיחה הזו' }, { status: 400 });

    return Response.json({ success: true, url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}