import React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";
import RecordingPlayer from "@/components/recordings/RecordingPlayer";
import MissedCallNotice from "@/components/recordings/MissedCallNotice";
import NoRecordingNotice from "@/components/recordings/NoRecordingNotice";
import DownloadRecordingButton from "@/components/recordings/DownloadRecordingButton";
import HideContactButton from "@/components/recordings/HideContactButton";

export default function RecordingCard({ recording, sendingId, onSend, onHide }) {
  const r = recording;
  const isSending = sendingId === r.id;
  const sent = r.sent || r.sentAt;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <div className="font-medium text-foreground">{r.callerFriendly || "—"}</div>
        <div className="text-sm text-muted-foreground font-mono mt-0.5" dir="ltr">{r.callerNumber || "—"}</div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span dir="ltr" className="font-mono">{formatDuration(r.duration)}</span>
        <span>{formatDate(r.callDate || r.created_date)}</span>
      </div>
      {Number(r.duration) <= 0 ? (
        <MissedCallNotice />
      ) : r.recordingMissing ? (
        <NoRecordingNotice />
      ) : (
        <RecordingPlayer recording={r} />
      )}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
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
        <div className="flex items-center gap-2">
        <DownloadRecordingButton recording={r} />
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
        </div>
      </div>
      {onHide && (
        <div className="pt-1">
          <HideContactButton withLabel onClick={() => onHide(r)} />
        </div>
      )}
    </div>
  );
}