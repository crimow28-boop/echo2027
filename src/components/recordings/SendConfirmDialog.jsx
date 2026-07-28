import React from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDuration, formatDate } from "@/lib/recordingUtils";

export default function SendConfirmDialog({ recording, sending, onConfirm, onClose }) {
  const open = !!recording;
  const r = recording;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border border-border p-0 gap-0 shadow-lg">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            תצוגה מקדימה · שליחה לוואטסאפ
          </div>
          <h2 className="mt-3 text-xl font-semibold">{r?.callerFriendly || "—"}</h2>
          <p className="mt-1 text-sm text-muted-foreground font-mono" dir="ltr">{r?.callerNumber || "—"}</p>
        </div>

        <div className="p-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2.5">
            <span className="text-muted-foreground">תאריך שיחה</span>
            <span>{r ? formatDate(r.callDate || r.created_date) : "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2.5">
            <span className="text-muted-foreground">משך</span>
            <span dir="ltr">{r ? formatDuration(r.duration) : "--:--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">יעד</span>
            <span dir="ltr" className="text-primary">{r?.callerNumber || "—"}</span>
          </div>
          <p className="pt-3 text-foreground leading-relaxed text-sm">
            ההקלטה תישלח כהודעת וואטסאפ עם קישור קבוע להאזנה. לאחר אישור, לא ניתן לבטל.
          </p>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-lg shadow-none h-11 text-sm font-medium"
          >
            ביטול
          </Button>
          <Button
            disabled={sending}
            onClick={onConfirm}
            className="flex-[1.4] gap-2 rounded-lg shadow-none h-11 text-sm font-medium"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            אישור שליחה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}