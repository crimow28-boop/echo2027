import React, { useEffect, useRef, useState } from "react";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import useOtpAutoFill from "@/hooks/useOtpAutoFill";
import { loadRememberedClient, rememberClient } from "@/lib/rememberedDevice";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoginField from "@/components/auth/LoginField";
import EchoLoadingScreen from "@/components/loading/EchoLoadingScreen";
import SignupPrompt from "@/components/auth/SignupPrompt";
import { Loader2, ArrowRight, MessageCircle, LogIn, Phone, KeyRound, ShieldCheck } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/7557abb16_Screenshot2026-07-31at231525-Photoroom.png";

export default function ClientLogin() {
  const [step, setStep] = useState("identify");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);
  const [checking, setChecking] = useState(true);
  const [autoFilled, setAutoFilled] = useState(false);
  const attempted = useRef("");

  // A client who already logged in on this device stays logged in until logout.
  useEffect(() => {
    (async () => {
      const saved = loadRememberedClient();
      if (saved && (await base44.auth.isAuthenticated())) {
        window.location.href = "/";
        return;
      }
      if (saved) setPhone(saved.phone || "");
      setChecking(false);
    })();
  }, []);


  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("requestLoginCode", { phone });
      if (res.data?.notRegistered) {
        setStep("signup");
        return;
      }
      if (!res.data?.success) throw new Error(res.data?.error || "שליחת הקוד נכשלה");
      setHint(res.data.phoneHint || "");
      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value) => {
    if (busy || attempted.current === value) return;
    attempted.current = value;
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("verifyLoginCode", { phone, code: value });
      if (!res.data?.success) throw new Error(res.data?.error || "הקוד אינו תקין");
      await base44.auth.loginViaEmailPassword(res.data.email, res.data.password);
      rememberClient("", phone);
      setEntering(true);
      setTimeout(() => { window.location.href = "/"; }, 900);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  useOtpAutoFill(
    (found) => {
      setAutoFilled(true);
      setCode(found);
    },
    step === "code" && !busy
  );

  // Verify automatically as soon as all six digits are in place.
  useEffect(() => {
    if (step === "code" && code.length === 6) verify(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step]);

  const buttonClass = "w-full gap-3 h-14 rounded-full text-base font-medium shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]";

  if (entering || checking) return <EchoLoadingScreen message="מארגנים את השיחות שלך..." />;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-md text-right">
        <img src={LOGO} alt="echo" className="h-16 w-auto mx-auto" />

        <div className="mt-10 text-center">
          <h1 className="font-heading text-4xl tracking-tight">
            {step === "identify" ? "כניסה למערכת" : step === "signup" ? "פתיחת חשבון" : "הזינו את הקוד"}
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xs mx-auto">
            {step === "identify"
              ? "הזינו את מספר הטלפון שלכם כדי להתחבר ל-Echo."
              : step === "signup"
                ? "עוד פרט קטן ואנחנו מטפלים בשאר."
                : `שלחנו קוד בוואטסאפ למספר שמסתיים ב-${hint}. הקוד בתוקף ל-5 דקות.`}
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] bg-card p-6 sm:p-7 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)]">
          {step === "identify" ? (
            <form onSubmit={sendCode} className="space-y-6">
              <LoginField
                id="phone"
                label="מספר טלפון"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                name="client-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={busy} className={buttonClass}>
                המשך
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              </Button>
            </form>
          ) : step === "signup" ? (
            <SignupPrompt phone={phone} onBack={() => setStep("identify")} />
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); verify(code); }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <KeyRound className="w-3.5 h-3.5" />
                  קוד חד-פעמי
                </div>
                <OtpCodeInput
                  value={code}
                  onChange={(v) => { setAutoFilled(false); setError(""); setCode(v); }}
                  disabled={busy}
                  autoFilled={autoFilled}
                />
                <p className="text-center text-xs text-muted-foreground transition-opacity duration-300">
                  {busy
                    ? "מאמתים את הקוד..."
                    : autoFilled
                      ? "הקוד זוהה אוטומטית"
                      : "הקוד יזוהה אוטומטית · אפשר גם להדביק אותו"}
                </p>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <Button type="submit" disabled={busy || code.length < 6} className={buttonClass}>
                התחברות
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              </Button>
              <button
                type="button"
                onClick={() => { setStep("identify"); setCode(""); setError(""); setAutoFilled(false); attempted.current = ""; }}
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