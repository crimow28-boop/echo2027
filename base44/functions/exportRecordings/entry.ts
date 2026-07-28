import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getRecordingUrls } from "../../shared/exmApi.ts";
import { getUserSettings } from "../../shared/userSettings.ts";

// Export the calling user's CallRecording rows with permanent (public) recording
// links from exm, so the spreadsheet stays usable over time. Returns rows for CSV.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await getUserSettings(base44);
    const token = settings?.exmToken;
    if (!token) return Response.json({ error: 'NO_SETTINGS' }, { status: 400 });

    // Pull the user's own recordings (owner-only RLS), newest first, via callDate cursor.
    const all = [];
    let cursor = null;
    let hasMore = true;
    let guard = 0;
    while (hasMore && guard < 100) {
      const query = cursor ? { callDate: { $lt: cursor } } : {};
      const batch = await base44.entities.CallRecording.filter(query, "-callDate", 500);
      all.push(...batch);
      hasMore = batch.length === 500;
      if (hasMore) cursor = batch[batch.length - 1].callDate;
      guard++;
    }

    // Fetch permanent (ttl=0) recording URLs from exm, in batches of 50.
    const withExternal = all.filter(r => r.externalId);
    const urlMap = new Map();
    for (let i = 0; i < withExternal.length; i += 50) {
      const ids = withExternal.slice(i, i + 50).map(r => r.externalId);
      try {
        const urls = await getRecordingUrls(token, ids, 0);
        for (const u of urls || []) {
          if (u.id && u.url) urlMap.set(u.id, u.url);
        }
      } catch (_e) {
        // partial failure — keep going so the export still completes
      }
    }

    const rows = all.map(r => ({
      name: r.callerFriendly || "",
      number: r.callerNumber || "",
      type: r.callType === "outgoing" ? "יוצאת" : "נכנסת",
      duration: r.duration || 0,
      date: r.callDate || "",
      sent: r.sent ? "נשלח" : "ממתין",
      link: (r.externalId && urlMap.get(r.externalId)) || r.recordingUrl || ""
    }));

    return Response.json({ success: true, count: rows.length, rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}