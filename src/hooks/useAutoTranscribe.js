import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Auto transcription preference, stored on the user. Cached so a long list of
// recording cards doesn't call auth.me() once per card.
let cached = null;

function loadPref() {
  if (!cached) cached = base44.auth.me().then((u) => u?.autoTranscribe !== false).catch(() => false);
  return cached;
}

export default function useAutoTranscribe() {
  const [enabled, setEnabled] = useState(null);

  useEffect(() => {
    let alive = true;
    loadPref().then((v) => alive && setEnabled(v));
    return () => { alive = false; };
  }, []);

  const update = async (value) => {
    setEnabled(value);
    cached = Promise.resolve(value);
    await base44.auth.updateMe({ autoTranscribe: value });
  };

  return { enabled: enabled === true, loaded: enabled !== null, setAutoTranscribe: update };
}