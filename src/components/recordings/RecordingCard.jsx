import React from "react";
import { PhoneIncoming, PhoneOutgoing, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingCard({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{r.callerFriendly || "—"}</div>
          <div className="text-xs text-muted-foreground font-mono" dir="ltr">{r.callerNumber || "—"}</div>
        </div>
        {r.callType === "outgoing" ? (
          <span className="inline-flex items-center gap-1 text-blue-400 text-xs">
            <PhoneOutgoing className="w-3.5 h-3.5" /> יוצאת
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
            <PhoneIncoming className="w-3.5 h-3.5" /> נכנסת
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono" dir="ltr">{formatDuration(r.duration)}</span>
        <span>{formatDate(r.callDate || r.created_date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        {r.sent ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" /> נשלח
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs">
            <Clock className="w-4 h-4" /> ממתין
          </span>
        )}
        <Button
          size="sm"
          variant={r.sent ? "secondary" : "default"}
          disabled={r.sent || isSending}
          onClick={() => onSend(r.id)}
          className="gap-1.5"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          שלח
        </Button>
      </div>
    </div>
  );
}