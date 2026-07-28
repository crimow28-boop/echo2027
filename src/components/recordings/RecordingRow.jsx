import React from "react";
import { PhoneIncoming, PhoneOutgoing, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function RecordingRow({ recording, sendingId, onSend }) {
  const r = recording;
  const isSending = sendingId === r.id;
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-accent/40 transition-colors">
      <td className="px-4 py-3.5 font-medium text-foreground">{r.callerFriendly || "—"}</td>
      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs" dir="ltr">{r.callerNumber || "—"}</td>
      <td className="px-4 py-3.5">
        {r.callType === "outgoing" ? (
          <span className="inline-flex items-center gap-1.5 text-[#0088ff]">
            <PhoneOutgoing className="w-4 h-4" /> <span className="text-xs">יוצאת</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[#00ffcc]">
            <PhoneIncoming className="w-4 h-4" /> <span className="text-xs">נכנסת</span>
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 font-mono text-muted-foreground text-xs" dir="ltr">{formatDuration(r.duration)}</td>
      <td className="px-4 py-3.5 text-muted-foreground text-xs">{formatDate(r.callDate || r.created_date)}</td>
      <td className="px-4 py-3.5">
        {r.sent ? (
          <span className="inline-flex items-center gap-2 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 glow-emerald-sm"></span> נשלח
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-amber-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 glow-amber-sm"></span> ממתין
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-center">
        <Button
          size="sm"
          disabled={isSending}
          onClick={() => onSend(r.id)}
          className="gap-1.5 gradient-teal border-0 text-primary-foreground glow-teal-sm hover:opacity-90"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          שלח ללקוח
        </Button>
      </td>
    </tr>
  );
}