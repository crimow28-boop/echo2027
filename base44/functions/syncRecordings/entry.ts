import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";
import { listCalls, mapCall } from "../../shared/exmApi.ts";

// Pull call history from exm.co.il and upsert into CallRecording by externalId.
// Newest-first; paginates with the opaque cursor. Default window: 2 years back.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = secrets.get("EXM_API_TOKEN");
    if (!token) return Response.json({ error: 'EXM_API_TOKEN secret not set' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const from = body.from || new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    const to = body.to || (now.toISOString().slice(0, 10) + " 23:59:59");

    // Clean up pre-sync orphan records (created without externalId).
    await base44.asServiceRole.entities.CallRecording.deleteMany({ externalId: null });

    // Build externalId -> existing record id map for upsert.
    const existing = await base44.asServiceRole.entities.CallRecording.filter({}, "-callDate", 5000);
    const idMap = new Map();
    for (const r of existing) {
      if (r.externalId) idMap.set(r.externalId, r.id);
    }

    const toCreate = [];
    const toUpdate = [];
    let next = null;
    let total = 0;
    let pages = 0;
    const MAX_PAGES = 50;

    do {
      const page = await listCalls(token, { from, to, items: 100, next });
      const calls = page.calls || [];
      for (const call of calls) {
        const mapped = mapCall(call);
        if (!mapped.externalId) continue;
        total++;
        const existingId = idMap.get(mapped.externalId);
        if (existingId) {
          toUpdate.push({ id: existingId, ...mapped });
        } else {
          toCreate.push(mapped);
          idMap.set(mapped.externalId, "new");
        }
      }
      next = page.metadata?.next_page_token || null;
      pages++;
    } while (next && pages < MAX_PAGES);

    if (toCreate.length) {
      await base44.asServiceRole.entities.CallRecording.bulkCreate(toCreate);
    }
    if (toUpdate.length) {
      await base44.asServiceRole.entities.CallRecording.bulkUpdate(toUpdate);
    }

    return Response.json({
      success: true,
      total,
      created: toCreate.length,
      updated: toUpdate.length,
      pages
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}