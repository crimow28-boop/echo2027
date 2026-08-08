import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Auto transcription preference, stored on the user. Cached so a long list of
// recording cards doesn't call auth.me() once per card.
// `since` marks when the feature was turned on — older calls are never
// transcribed retroactively.
let cached = null;

function loadPref() {
  if (!cached) {
    cached = base44.auth
      .me()
      .then((u) => ({ enabled: u?.autoTranscribe === true, since: u?.autoTranscribeSince || null }))
      .catch(() => ({ enabled: false, since: null }));
  }
  return cached;
}

export default function useAutoTranscribe() {
  const [pref, setPref] = useState(null);

  useEffect(() => {
    let alive = true;
    loadPref().then((v) => alive && setPref(v));
    return () => { alive = false; };
  }, []);

  const update = async (value) => {
    const next = { enabled: value, since: value ? new Date().toISOString() : null };
    setPref(next);
    cached = Promise.resolve(next);
    await base44.auth.updateMe({ autoTranscribe: value, autoTranscribeSince: next.since });
  };

  return {
    enabled: pref?.enabled === true,
    since: pref?.since || null,
    loaded: pref !== null,
    setAutoTranscribe: update
  };
}