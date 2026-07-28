import React from "react";
import { PhoneIncoming, PhoneOutgoing, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingRow({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-medium">{r.callerFriendly || "—"}</td>
      <td className="px-4 py-3 text-muted-foreground font-mono text-xs" dir="ltr">{r.callerNumber || "—"}</td>
      <td className="px-4 py-3">
        {r.callType === "outgoing" ? (
          <span className="inline-flex items-center gap-1.5 text-blue-400">
            <PhoneOutgoing className="w-4 h-4" /> יוצאת
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <PhoneIncoming className="w-4 h-4" /> נכנסת
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-mono" dir="ltr">{formatDuration(r.duration)}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(r.callDate || r.created_date)}</td>
      <td className="px-4 py-3">
        {r.sent ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" /> נשלח
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs">
            <Clock className="w-4 h-4" /> ממתין
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <Button
          size="sm"
          variant={r.sent ? "secondary" : "default"}
          disabled={r.sent || isSending}
          onClick={() => onSend(r.id)}
          className="gap-1.5"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {r.sent ? "נשלח" : "שלח ללקוח"}
        </Button>
      </td>
    </tr>
  );
}