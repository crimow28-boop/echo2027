import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, CheckCircle2, Building2, User, Phone, ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoginField from "@/components/auth/LoginField";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function RequestAccount() {
  const [form, setForm] = useState({ businessName: "", contactName: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("requestAccount", form);
      if (!res.data?.success) throw new Error(res.data?.error || "השליחה נכשלה");
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-md text-right">
        <img src={LOGO} alt="echo" className="h-16 w-auto mx-auto" />

        {done ? (
          <div className="mt-10 rounded-[2rem] bg-card p-8 text-center shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)]">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-7 h-7" />
            </span>
            <h1 className="mt-5 font-heading text-2xl tracking-tight">הבקשה נשלחה</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ניצור איתכם קשר בוואטסאפ עם מספר החשבון ופרטי הכניסה למערכת.
            </p>
            <Button asChild variant="outline" className="mt-7 w-full gap-2 h-12 rounded-2xl text-sm">
              <Link to="/demo">
                <ArrowRight className="w-4 h-4" />
                חזרה לדף הבית
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-10 text-center">
              <h1 className="font-heading text-4xl tracking-tight">פתיחת חשבון</h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xs mx-auto">
                השאירו פרטים ונחזור אליכם בוואטסאפ עם מספר חשבון וכל מה שצריך כדי להתחיל.
              </p>
            </div>

            <div className="mt-10 rounded-[2rem] bg-card p-6 sm:p-7 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)]">
              <form onSubmit={submit} className="space-y-6">
                <LoginField id="biz" label="שם העסק" icon={Building2} value={form.businessName} onChange={set("businessName")} placeholder="מוסך אלון" />
                <LoginField id="contact" label="איש קשר" icon={User} value={form.contactName} onChange={set("contactName")} placeholder="ישראל ישראלי" />
                <LoginField id="reqphone" label="טלפון" icon={Phone} value={form.phone} onChange={set("phone")} placeholder="0501234567" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">הערות (לא חובה)</p>
                  <Textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="משהו שכדאי שנדע?" className="text-sm rounded-2xl" />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full gap-3 h-14 rounded-2xl text-base font-medium shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]">
                  שליחת הבקשה
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <Link to="/client-login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <LogIn className="w-4 h-4" />
                כבר יש לי חשבון
              </Link>
            </div>

            <div className="mt-10 flex flex-col items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground text-center max-w-[15rem]">
                הפרטים שלכם מאובטחים ונשמרים בצורה מוצפנת.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}