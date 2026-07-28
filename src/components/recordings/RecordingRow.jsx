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
        {r.sent ? (
          <span className="inline-flex items-center gap-2 text-primary font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-primary"></span> נשלח
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-amber-600 font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-amber-500"></span> ממתין
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-center">
        <Button
          size="sm"
          disabled={isSending}
          onClick={() => onSend(r.id)}
          className="gap-1.5 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-none hover:bg-foreground hover:text-background font-mono text-[11px] uppercase tracking-wider"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          שלח
        </Button>
      </td>
    </tr>
  );
}