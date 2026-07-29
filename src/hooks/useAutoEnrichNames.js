import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { hasRealName } from "@/lib/recordingUtils";

// Automatically fetch missing contact names from WhatsApp for the recordings
// currently on screen, then refresh the list.
export default function useAutoEnrichNames(recordings, onDone) {
  const doneRef = useRef(new Set());
  const busyRef = useRef(false);

  useEffect(() => {
    const numbers = [];
    for (const r of recordings || []) {
      const number = String(r.callerNumber || "").trim();
      if (!number || hasRealName(r) || doneRef.current.has(number)) continue;
      numbers.push(number);
      if (numbers.length >= 20) break;
    }
    if (numbers.length === 0 || busyRef.current) return;
    busyRef.current = true;
    numbers.forEach((n) => doneRef.current.add(n));
    base44.functions
      .invoke("enrichContactNames", { numbers })
      .then((res) => {
        if (res?.data?.updated > 0) onDone();
      })
      .catch(() => {})
      .finally(() => {
        busyRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordings]);
}