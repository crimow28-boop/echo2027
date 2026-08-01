import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { encryptSettingsFields } from "../../shared/secretsBox.ts";

// Saves a UserSettings record with sensitive fields (tokens, password) encrypted
// at rest. Writes go through the user-authenticated client, so the entity's RLS
// applies exactly as it would for a direct write from the app.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const data = await encryptSettingsFields(body?.data || {});
    if (Object.keys(data).length === 0) {
      return Response.json({ success: false, error: 'NO_DATA' });
    }

    if (body?.id) {
      await base44.entities.UserSettings.update(body.id, data);
      return Response.json({ success: true, id: body.id });
    }
    const created = await base44.entities.UserSettings.create(data);
    return Response.json({ success: true, id: created.id });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}