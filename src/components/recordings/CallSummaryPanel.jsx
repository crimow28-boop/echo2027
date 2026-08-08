import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { errorText } from "@/lib/errorText";
import { Loader2, Sparkles, Send, RefreshCw, Check } from "lucide-react";

// "שלח סיכום שיחה ללקוח": generates an AI summary, lets the user edit it,
// then sends the final text to the client on WhatsApp.
export default function CallSummaryPanel({ recording, disabled }) {
  const [summary, setSummary] = useState(recording.summary || "");
  const [open, setOpen] = useState(!!recording.summary);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const generate = async (force) => {
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const res = await base44.functions.invoke("summarizeCall", { recordId: recording.id, force });
      if (!res.data?.success) throw new Error(errorText(res.data?.error, "הפקת הסיכום נכשלה"));
      setSummary(res.data.summary || "");
      setOpen(true);
    } catch (err) {
      setError(errorText(err, "הפקת הסיכום נכשלה"));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const res = await base44.functions.invoke("sendCallSummary", {
        recordId: recording.id,
        message: summary
      });
      if (!res.data?.success) throw new Error(errorText(res.data?.error, "שליחת הסיכום נכשלה"));
      setSent(true);
    } catch (err) {
      setError(errorText(err, "שליחת הסיכום נכשלה"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3 space-y-3">
      {!open ? (
        <Button disabled={disabled || busy} onClick={() => generate(false)} className="w-full gap-2 h-10">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          שלח סיכום שיחה ללקוח
        </Button>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            תצוגה לפני שליחה — ניתן לערוך את הסיכום לפני שהוא נשלח ללקוח.
          </p>
          <Textarea
            dir="rtl"
            rows={5}
            value={summary}
            onChange={(e) => { setSummary(e.target.value); setSent(false); }}
            className="text-right text-sm bg-card max-h-[28vh] overflow-y-auto leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={sending || !summary.trim()} onClick={send} className="gap-2 h-9">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {sent ? "נשלח ללקוח" : "שלח ללקוח"}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => generate(true)} className="gap-2 h-9">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              סיכום מחדש
            </Button>
          </div>
        </>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}