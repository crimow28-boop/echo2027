import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getSettingsForUserId } from "../../shared/userSettings.ts";

// Public endpoint: resolve an Echo listen token to a fresh short-lived (10 min)
// EXM signed URL and redirect to it. This way the link a client received in
// WhatsApp never exposes a permanent public EXM URL, and access can be revoked
// by clearing the recording's listenToken.
function fail(message) {
  return new Response(
    `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><title>Echo</title></head>` +
    `<body style="font-family:sans-serif;text-align:center;padding:64px 24px;color:#333">` +
    `<p style="font-size:18px">${message}</p></body></html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const token = (new URL(req.url).searchParams.get("t") || "").trim();
    if (token.length < 16) return fail("הקישור אינו תקין");

    const rows = await base44.asServiceRole.entities.CallRecording.filter(
      { listenToken: token },
      "-created_date",
      1
    );
    const recording = rows?.[0];
    if (!recording || !recording.externalId) return fail("ההקלטה לא נמצאה");

    const settings = await getSettingsForUserId(base44, recording.created_by_id);
    if (!settings?.exmToken) return fail("ההקלטה אינה זמינה כרגע — נסו שוב מאוחר יותר");

    const urls = await getRecordingUrls(settings.exmToken, [recording.externalId], 10);
    const found = (urls || []).find((u) => u.id === recording.externalId);
    if (!found?.url) return fail("ההקלטה אינה זמינה כרגע — נסו שוב מאוחר יותר");

    return Response.redirect(found.url, 302);
  } catch (_error) {
    return fail("ההקלטה אינה זמינה כרגע — נסו שוב מאוחר יותר");
  }
}