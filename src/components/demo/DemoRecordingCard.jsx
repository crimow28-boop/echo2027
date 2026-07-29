import React from "react";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoPlayer from "@/components/demo/DemoPlayer";

const fmtDate = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function DemoRecordingCard({ recording, sent, onSend }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{recording.callerFriendly}</p>
          <p className="text-xs text-muted-foreground font-mono" dir="ltr">
            {recording.callerNumber}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground shrink-0">{fmtDate(recording.callDate)}</p>
      </div>

      <DemoPlayer duration={recording.duration} audioUrl={recording.audioUrl} />

      <div className="flex items-center justify-between gap-3">
        {sent ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary">
            <Check className="w-3.5 h-3.5" />
            נשלח ללקוח
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">ממתין לשליחה</span>
        )}
        <Button
          size="sm"
          variant={sent ? "outline" : "default"}
          onClick={() => onSend(recording)}
          className="gap-2 rounded-lg text-xs shadow-none"
        >
          <Send className="w-3.5 h-3.5" />
          {sent ? "שליחה חוזרת" : "שליחה בוואטסאפ"}
        </Button>
      </div>
    </div>
  );
}