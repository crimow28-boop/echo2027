import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoginField from "@/components/auth/LoginField";
import EchoLoadingScreen from "@/components/loading/EchoLoadingScreen";
import { Loader2, ArrowRight, MessageCircle, LogIn, User, Phone, KeyRound, ShieldCheck } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function ClientLogin() {
  const [step, setStep] = useState("identify");
  const [accountNumber, setAccountNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);

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
      setEntering(true);
      setTimeout(() => { window.location.href = "/"; }, 900);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const buttonClass = "w-full gap-3 h-14 rounded-2xl text-base font-medium shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]";

  if (entering) return <EchoLoadingScreen message="מארגנים את השיחות שלך..." />;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-md text-right">
        <img src={LOGO} alt="echo" className="h-16 w-auto mx-auto" />

        <div className="mt-10 text-center">
          <h1 className="font-heading text-4xl tracking-tight">
            {step === "identify" ? "כניסה למערכת" : "הזינו את הקוד"}
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xs mx-auto">
            {step === "identify"
              ? "הזינו את מספר החשבון והטלפון שקיבלתם כדי להתחבר ל-Echo."
              : `שלחנו קוד בוואטסאפ למספר שמסתיים ב-${hint}. הקוד בתוקף ל-5 דקות.`}
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] bg-card p-6 sm:p-7 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)]">
          {step === "identify" ? (
            <form onSubmit={sendCode} className="space-y-6">
              <LoginField
                id="acc"
                label="מספר חשבון"
                icon={User}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1042"
              />
              <LoginField
                id="phone"
                label="מספר טלפון"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={busy} className={buttonClass}>
                שליחת קוד בוואטסאפ
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-6">
              <LoginField
                id="code"
                label="קוד חד-פעמי"
                icon={KeyRound}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                inputClassName="text-center tracking-[0.4em]"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={busy} className={buttonClass}>
                התחברות
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
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

        <div className="mt-10 flex flex-col items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground text-center max-w-[15rem]">
            הפרטים שלכם מאובטחים ונשמרים בצורה מוצפנת.
          </p>
        </div>
      </div>
    </div>
  );
}