import React, { useEffect, useState } from "react";
import { Loader2, Send, Pencil, CheckCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppChatPreview from "@/components/demo/WhatsAppChatPreview";

const buildMessage = (rec) =>
  `שלום ${rec?.callerFriendly || ""},\nמצורפת הקלטת השיחה שלנו.\nתודה, echo (דמו)`;

export default function DemoSendDialog({ recording, onConfirm, onClose }) {
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (recording) {
      setMessage(buildMessage(recording));
      setEditing(false);
      setSending(false);
      setSent(false);
      setRead(false);
    }
  }, [recording]);

  const send = () => {
    const id = recording.id;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setRead(true), 800);
      setTimeout(() => onConfirm(id), 2200);
    }, 900);
  };

  return (
    <Dialog open={!!recording} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base">שליחת ההקלטה בוואטסאפ</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          זו הדגמה — לא נשלחת הודעה אמיתית.
        </p>

        {editing && !sent ? (
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="text-sm" />
        ) : (
          <WhatsAppChatPreview recording={recording} message={message} read={read} />
        )}

        {sent ? (
          <div className="flex items-center justify-center gap-2 pt-1 text-sm text-primary">
            <CheckCheck className={`w-4 h-4 transition-colors duration-500 ${read ? "text-[#53bdeb]" : "text-muted-foreground"}`} />
            {read ? "ההודעה נשלחה ונקראה" : "ההודעה נשלחה"}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {editing ? "סיום עריכה" : "עריכת ההודעה"}
            </button>
            <Button onClick={send} disabled={sending} className="gap-2 h-10 rounded-lg text-sm">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              שליחה
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}