import React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingCard({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <div className="border-2 border-foreground bg-card p-4 space-y-3">
      <div>
        <div className="font-medium text-foreground">{r.callerFriendly || "—"}</div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">{r.callerNumber || "—"}</div>
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
        <span dir="ltr">{formatDuration(r.duration)}</span>
        <span>{formatDate(r.callDate || r.created_date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-border">
        {r.sentAt ? (
          <span className="inline-flex items-center gap-2 text-primary font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-primary"></span> נשלחה · {formatDate(r.sentAt)}
          </span>
        ) : r.sent ? (
          <span className="inline-flex items-center gap-2 text-primary font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-primary"></span> נשלחה
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-amber-600 font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-amber-500"></span> שלא נשלחה
          </span>
        )}
        <Button
          disabled={isSending}
          onClick={() => onSend(r.id)}
          className={`gap-2 rounded-none border-2 border-foreground shadow-none hover:translate-y-[-1px] transition-transform font-mono text-[11px] uppercase tracking-wider ${
            r.sent || r.sentAt
              ? "h-8 px-2.5 bg-transparent text-foreground hover:bg-foreground hover:text-background"
              : "h-9 px-5 bg-primary text-primary-foreground font-bold hover:bg-foreground hover:text-background"
          }`}
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {r.sent || r.sentAt ? "שלח שוב" : "שלח"}
        </Button>
      </div>
    </div>
  );
}