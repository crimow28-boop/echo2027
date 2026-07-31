import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

// Verifies ownership of the phone number with a WhatsApp code before the
// account is actually opened. `payload` is the account request details.
export default function SignupCodeStep({ phone, payload, onDone, onBack }) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sentRef = useRef(false);

  const sendCode = async () => {
    setError("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("requestSignupCode", { phone });
      if (!res.data?.success) setError(res.data?.error || "שליחת הקוד נכשלה");
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("requestAccount", { ...payload, phone, code });
      if (!res.data?.success) throw new Error(res.data?.error || "האימות נכשל");
      onDone();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
          {sending ? "שולחים קוד אימות בוואטסאפ..." : `שלחנו קוד אימות בוואטסאפ למספר ${phone}. הזינו אותו כדי לפתוח את החשבון.`}
        </p>
      </div>

      <OtpCodeInput value={code} onChange={setCode} disabled={busy || sending} />

      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      <Button type="submit" disabled={busy || sending || code.length !== 6} className="w-full gap-3 h-14 rounded-full text-base font-medium">
        אימות ופתיחת חשבון
        {busy && <Loader2 className="w-5 h-5 animate-spin" />}
      </Button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" /> חזרה
        </button>
        <button
          type="button"
          onClick={sendCode}
          disabled={sending}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          שליחת קוד מחדש
        </button>
      </div>
    </form>
  );
}