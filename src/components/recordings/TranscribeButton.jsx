import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import TranscriptDialog from "@/components/recordings/TranscriptDialog";
import { enqueueTranscribe, enqueueSummarize } from "@/lib/transcribeQueue";
import useAutoTranscribe from "@/hooks/useAutoTranscribe";

export default function TranscribeButton({ recording }) {
  const { enabled, since } = useAutoTranscribe();
  const [transcript, setTranscript] = useState(recording.transcript || []);
  const [summary, setSummary] = useState(recording.summary || "");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const started = useRef(false);
  const ready = transcript.length > 0;

  useEffect(() => {
    if (!enabled || ready || started.current) return;
    // Never retroactive: only calls that happened after the feature was turned on.
    const callTime = recording.callDate || recording.created_date;
    if (!since || !callTime || callTime < since) return;
    started.current = true;
    setBusy(true);
    enqueueTranscribe(recording.id)
      .then(async (res) => {
        if (!res?.data?.success) return;
        setTranscript(res.data.transcript || []);
        // Auto summary right after the transcript is ready.
        if (!summary) {
          const sum = await enqueueSummarize(recording.id).catch(() => null);
          if (sum?.data?.success) setSummary(sum.data.summary || "");
        }
      })
      .catch(() => {})
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, since]);

  if (busy) {
    return (
      <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-muted text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> מתמלל...
      </span>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`gap-1.5 h-8 px-3 text-xs font-medium rounded-lg shadow-none ${
          ready ? "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10" : ""
        }`}
      >
        {ready ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
        {ready ? "תמלול מוכן" : "תמלול"}
      </Button>
      {open && (
        <TranscriptDialog recording={{ ...recording, transcript, summary }} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}