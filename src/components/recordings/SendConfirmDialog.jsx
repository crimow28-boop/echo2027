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
      <DialogContent className="max-w-md rounded-none border-2 border-foreground p-0 gap-0">
        <div className="p-5 border-b-2 border-foreground">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            תצוגה מקדימה · שליחה לוואטסאפ
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-none">{r?.callerFriendly || "—"}</h2>
          <p className="mt-1 font-mono text-sm text-muted-foreground" dir="ltr">{r?.callerNumber || "—"}</p>
        </div>

        <div className="p-5 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground uppercase tracking-wider">תאריך שיחה</span>
            <span>{r ? formatDate(r.callDate || r.created_date) : "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground uppercase tracking-wider">משך</span>
            <span dir="ltr">{r ? formatDuration(r.duration) : "--:--"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">יעד</span>
            <span dir="ltr" className="text-primary">{r?.callerNumber || "—"}</span>
          </div>
          <p className="pt-3 text-foreground leading-relaxed font-sans text-sm">
            ההקלטה תישלח כהודעת וואטסאפ עם קישור קבוע להאזנה. לאחר אישור, לא ניתן לבטל.
          </p>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-none border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background shadow-none font-mono text-[11px] uppercase tracking-wider h-11"
          >
            ביטול
          </Button>
          <Button
            disabled={sending}
            onClick={onConfirm}
            className="flex-[1.4] gap-2 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-none hover:bg-foreground hover:text-background font-mono text-xs uppercase tracking-wider h-11 font-bold"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            אישור שליחה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}