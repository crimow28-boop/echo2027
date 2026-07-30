import React, { useEffect, useState } from "react";
import { Send, Loader2, MessageCircle, Pencil, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppBubble from "@/components/recordings/WhatsAppBubble";
import { buildRecordingMessage } from "@/lib/messageTemplate";

export default function SendConfirmDialog({ recording, sending, onConfirm, onClose }) {
  const open = !!recording;
  const r = recording;
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => setBusinessName(u?.full_name || "")).catch(() => {});
    base44.entities.MessageTemplate.list("-updated_date", 1)
      .then((rows) => setTemplate(rows?.[0]?.body || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (r) {
      setMessage(buildRecordingMessage(r, businessName, template));
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r?.id, businessName, template]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-md rounded-2xl border border-border p-0 gap-0 shadow-lg text-right">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            תצוגה מקדימה · שליחה לוואטסאפ
          </div>
          <h2 className="mt-3 text-lg font-semibold">{r?.callerFriendly || "—"}</h2>
          <p className="mt-1 text-sm text-muted-foreground font-mono" dir="ltr">{r?.callerNumber || "—"}</p>
        </div>

        <div className="p-4 max-h-[45vh] overflow-y-auto">
          {editing ? (
            <Textarea
              dir="rtl"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="text-right text-[13px] leading-relaxed rounded-xl"
            />
          ) : (
            <WhatsAppBubble message={message} />
          )}
        </div>

        <div className="px-5 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editing ? "סיום עריכה" : "עריכת ההודעה"}
          </button>
          <span className="text-xs text-muted-foreground">הקישור יוצר אוטומטית בשליחה</span>
        </div>

        <div className="flex gap-3 p-5 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-lg shadow-none h-11 text-sm font-medium"
          >
            ביטול
          </Button>
          <Button
            disabled={sending}
            onClick={() => onConfirm(message)}
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