import React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingRow({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
      <td className="px-4 py-3.5 font-medium text-foreground">{r.callerFriendly || "—"}</td>
      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs" dir="ltr">{r.callerNumber || "—"}</td>
      <td className="px-4 py-3.5 font-mono text-muted-foreground text-xs" dir="ltr">{formatDuration(r.duration)}</td>
      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">{formatDate(r.callDate || r.created_date)}</td>
      <td className="px-4 py-3.5">
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
      </td>
      <td className="px-4 py-2.5 text-center">
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
          {r.sent || r.sentAt ? "שוב" : "שלח"}
        </Button>
      </td>
    </tr>
  );
}