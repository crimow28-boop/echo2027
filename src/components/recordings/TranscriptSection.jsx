import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranscriptChat from "@/components/recordings/TranscriptChat";
import useTranscriptEnabled from "@/hooks/useTranscriptEnabled";

export default function TranscriptSection({ recording }) {
  const enabled = useTranscriptEnabled();
  const [messages, setMessages] = useState(recording.transcript || null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!enabled || Number(recording.duration) <= 0 || recording.recordingMissing) return null;

  const run = async () => {
    if (messages) return setOpen((v) => !v);
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("transcribeRecording", { recordId: recording.id });
      if (!res.data?.success) throw new Error(res.data?.error || "התמלול נכשל");
      setMessages(res.data.transcript);
      setOpen(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "התמלול נכשל");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-3 border-t border-border space-y-3">
      <Button
        variant="outline"
        disabled={loading}
        onClick={run}
        className="gap-2 h-9 px-3.5 rounded-full shadow-none text-xs font-medium"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : messages ? (
          open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        {loading ? "מתמללים את השיחה..." : messages ? (open ? "הסתר תמלול" : "הצג תמלול") : "תמלול השיחה"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {open && messages && (
        <div className="rounded-2xl bg-muted/30 border border-border p-3">
          <TranscriptChat messages={messages} />
        </div>
      )}
    </div>
  );
}