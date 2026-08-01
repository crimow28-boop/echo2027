import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

const randomPassword = () => `Ec${Math.random().toString(36).slice(2, 10)}${Math.floor(1000 + Math.random() * 9000)}!`;

// Admin-side helper: creates the hidden platform account behind a client.
// The verification code is emailed to the address entered here (use your own
// alias, e.g. you+client1@gmail.com) — the client never sees it.
export default function CreateLoginAccount({ config, onDone }) {
  const [email, setEmail] = useState(config.clientEmail || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState(config.loginPassword ? "done" : "start");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startRegister = async () => {
    setError("");
    setBusy(true);
    try {
      const pw = randomPassword();
      await base44.auth.register({ email: email.trim().toLowerCase(), password: pw });
      setPassword(pw);
      setStage("otp");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmOtp = async () => {
    setError("");
    setBusy(true);
    try {
      await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode: otp.trim() });
      // Saved via the backend so the password is encrypted at rest.
      const res = await base44.functions.invoke("saveClientSettings", {
        id: config.id,
        data: { clientEmail: email.trim().toLowerCase(), loginPassword: password }
      });
      if (!res.data?.success) throw new Error(res.data?.error || "שמירת החשבון נכשלה");
      setStage("done");
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (stage === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-primary">
        <CheckCircle2 className="w-3.5 h-3.5" /> חשבון התחברות מוכן
      </span>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 text-right">
      {stage === "start" ? (
        <>
          <Label className="text-xs font-medium text-foreground/80">אימייל פנימי לחשבון (הלקוח לא רואה אותו)</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you+client1@gmail.com" dir="ltr" className="h-9 rounded-lg font-mono text-xs" />
          <Button size="sm" disabled={busy || !email.trim()} onClick={startRegister} className="gap-1.5 h-8 rounded-lg text-xs">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            יצירת חשבון התחברות
          </Button>
        </>
      ) : (
        <>
          <Label className="text-xs font-medium text-foreground/80">קוד האימות שנשלח לאימייל הזה</Label>
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" dir="ltr" className="h-9 rounded-lg font-mono text-xs" />
          <Button size="sm" disabled={busy || !otp.trim()} onClick={confirmOtp} className="gap-1.5 h-8 rounded-lg text-xs">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            אישור והשלמת החשבון
          </Button>
        </>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}