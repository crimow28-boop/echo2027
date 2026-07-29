import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, MessageCircle, LogIn } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function ClientLogin() {
  const [step, setStep] = useState("identify");
  const [accountNumber, setAccountNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("requestLoginCode", { accountNumber, phone });
      if (!res.data?.success) throw new Error(res.data?.error || "שליחת הקוד נכשלה");
      setHint(res.data.phoneHint || "");
      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("verifyLoginCode", { accountNumber, phone, code });
      if (!res.data?.success) throw new Error(res.data?.error || "הקוד אינו תקין");
      await base44.auth.loginViaEmailPassword(res.data.email, res.data.password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const inputClass = "h-12 rounded-xl border border-border bg-card font-mono text-base focus-visible:ring-0 focus-visible:border-primary/50";

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm text-right">
        <img src={LOGO} alt="echo" className="h-10 w-auto mx-auto mb-10" />

        {step === "identify" ? (
          <form onSubmit={sendCode} className="space-y-5">
            <div>
              <h1 className="font-heading text-2xl tracking-tight">כניסה למערכת</h1>
              <p className="mt-2 text-sm text-muted-foreground">הזינו את מספר החשבון והטלפון שקיבלתם</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc" className="text-xs font-medium text-foreground/80">מספר חשבון</Label>
              <Input id="acc" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="1042" dir="ltr" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-foreground/80">מספר טלפון</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" dir="ltr" className={inputClass} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full gap-2 h-12 rounded-xl text-sm font-medium">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              שליחת קוד בוואטסאפ
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-5">
            <div>
              <h1 className="font-heading text-2xl tracking-tight">הזינו את הקוד</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                שלחנו קוד בוואטסאפ למספר שמסתיים ב-{hint}. הקוד בתוקף ל-5 דקות.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-medium text-foreground/80">קוד חד-פעמי</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" dir="ltr" className={`${inputClass} text-center tracking-[0.4em]`} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full gap-2 h-12 rounded-xl text-sm font-medium">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              התחברות
            </Button>
            <button
              type="button"
              onClick={() => { setStep("identify"); setCode(""); setError(""); }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" /> חזרה
            </button>
          </form>
        )}
      </div>
    </div>
  );
}