import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoginField from "@/components/auth/LoginField";
import { Loader2, User, ArrowRight, CheckCircle2 } from "lucide-react";

// Shown when the phone number isn't registered — collects a name and leaves a lead.
export default function SignupPrompt({ phone, onBack }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("requestAccount", { contactName: name.trim(), phone });
      if (!res.data?.success) throw new Error(res.data?.error || "השליחה נכשלה");
      setDone(true);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle2 className="w-10 h-10 mx-auto text-primary" />
        <p className="font-heading text-xl">קיבלנו את הפרטים</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          שלחנו לך הודעה בוואטסאפ, ונציג שלנו יחזור אליך בהקדם.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        המספר {phone} עדיין לא רשום אצלנו. השאירו שם מלא ונחזור אליכם.
      </p>
      <LoginField
        id="fullname"
        label="שם מלא"
        icon={User}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ישראל ישראלי"
        name="full-name"
        type="text"
        autoComplete="off"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={busy || !name.trim()} className="w-full gap-3 h-14 rounded-full text-base font-medium">
        שליחת פרטים
        {busy && <Loader2 className="w-5 h-5 animate-spin" />}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="w-3.5 h-3.5" /> חזרה
      </button>
    </form>
  );
}