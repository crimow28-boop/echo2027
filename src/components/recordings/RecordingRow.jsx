import React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingRow({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  const sent = r.sent || r.sentAt;
  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
      <td className="px-4 py-3.5 font-medium text-foreground">{r.callerFriendly || "—"}</td>
      <td className="px-4 py-3.5 text-muted-foreground text-sm font-mono" dir="ltr">{r.callerNumber || "—"}</td>
      <td className="px-4 py-3.5 text-muted-foreground text-sm font-mono" dir="ltr">{formatDuration(r.duration)}</td>
      <td className="px-4 py-3.5 text-muted-foreground text-sm">{formatDate(r.callDate || r.created_date)}</td>
      <td className="px-4 py-3.5">
        {r.sentAt ? (
          <span className="inline-flex items-center gap-2 text-xs text-primary">
            <span className="w-2 h-2 rounded-full bg-primary"></span> נשלחה · {formatDate(r.sentAt)}
          </span>
        ) : sent ? (
          <span className="inline-flex items-center gap-2 text-xs text-primary">
            <span className="w-2 h-2 rounded-full bg-primary"></span> נשלחה
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> לא נשלחה
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 text-center">
        <Button
          disabled={isSending}
          onClick={() => onSend(r)}
          variant={sent ? "outline" : "default"}
          className={`gap-2 shadow-none text-sm font-medium rounded-lg ${
            sent ? "h-8 px-3" : "h-9 px-4"
          }`}
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {sent ? "שלח שוב" : "שלח"}
        </Button>
      </td>
    </tr>
  );
}