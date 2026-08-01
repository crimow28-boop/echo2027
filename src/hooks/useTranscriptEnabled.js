import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Cached once per session — the flag is set centrally by an admin.
let cached = null;

async function fetchFlag() {
  const rows = await base44.entities.UserSettings.filter({}, "-updated_date", 5);
  return (rows || []).some((r) => r.transcriptEnabled);
}

export default function useTranscriptEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!cached) cached = fetchFlag().catch(() => false);
    let alive = true;
    cached.then((v) => alive && setEnabled(!!v));
    return () => {
      alive = false;
    };
  }, []);

  return enabled;
}