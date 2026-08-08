import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TranscriptBubbles from "@/components/recordings/TranscriptBubbles";
import CallSummaryPanel from "@/components/recordings/CallSummaryPanel";
import { errorText } from "@/lib/errorText";
import { Loader2, ArrowLeftRight } from "lucide-react";

export default function TranscriptDialog({ recording, open, onOpenChange }) {
  const [transcript, setTranscript] = useState(recording.transcript || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [swapping, setSwapping] = useState(false);

  // Diarization sometimes mixes up which side is the agent — let the user flip it.
  const swapSpeakers = async () => {
    setSwapping(true);
    const swapped = transcript.map((s) => ({
      ...s,
      speaker: s.speaker === "agent" ? "client" : "agent"
    }));
    setTranscript(swapped);
    try {
      await base44.entities.CallRecording.update(recording.id, { transcript: swapped });
    } finally {
      setSwapping(false);
    }
  };

  const run = async (force) => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("transcribeRecording", { recordId: recording.id, force });
      if (!res.data?.success) throw new Error(errorText(res.data?.error, "התמלול נכשל"));
      setTranscript(res.data.transcript || []);
    } catch (err) {
      setError(errorText(err, "התמלול נכשל"));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (open && !transcript.length && !busy) run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg text-right">
        <DialogHeader>
          <DialogTitle className="text-right">
            תמלול השיחה · {recording.callerFriendly || recording.callerNumber}
          </DialogTitle>
        </DialogHeader>

        {busy && !transcript.length ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> מתמללים את השיחה...
          </div>
        ) : error ? (
          <p className="py-6 text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-3">
            {!!transcript.length && <CallSummaryPanel recording={recording} disabled={busy} />}
            <div className="max-h-[50vh] overflow-y-auto pl-1">
              <TranscriptBubbles transcript={transcript} />
            </div>
          </div>
        )}

        {!!transcript.length && (
          <Button variant="outline" disabled={busy || swapping} onClick={swapSpeakers} className="gap-2 h-9">
            {swapping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
            החלף דוברים
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}