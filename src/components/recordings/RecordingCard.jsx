import React from "react";
import { PhoneIncoming, PhoneOutgoing, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingCard({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 space-y-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition-colors hover:border-[#00ffcc]/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-foreground">{r.callerFriendly || "—"}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">{r.callerNumber || "—"}</div>
        </div>
        {r.callType === "outgoing" ? (
          <span className="inline-flex items-center gap-1 text-[#0088ff] text-xs bg-[#0088ff]/10 px-2 py-1 rounded-full">
            <PhoneOutgoing className="w-3.5 h-3.5" /> יוצאת
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#00ffcc] text-xs bg-[#00ffcc]/10 px-2 py-1 rounded-full">
            <PhoneIncoming className="w-3.5 h-3.5" /> נכנסת
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono" dir="ltr">{formatDuration(r.duration)}</span>
        <span>{formatDate(r.callDate || r.created_date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
        {r.sent ? (
          <span className="inline-flex items-center gap-2 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 glow-emerald-sm"></span> נשלח
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-amber-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 glow-amber-sm"></span> ממתין
          </span>
        )}
        <Button
          size="sm"
          variant={r.sent ? "secondary" : "default"}
          disabled={r.sent || isSending}
          onClick={() => onSend(r.id)}
          className={`gap-1.5 ${r.sent ? "" : "gradient-teal border-0 text-primary-foreground glow-teal-sm hover:opacity-90"}`}
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {r.sent ? "נשלח" : "שלח"}
        </Button>
      </div>
    </div>
  );
}