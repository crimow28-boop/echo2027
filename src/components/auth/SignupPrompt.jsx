import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginField from "@/components/auth/LoginField";
import SignupCodeStep from "@/components/auth/SignupCodeStep";
import { User, ArrowRight, CheckCircle2 } from "lucide-react";

// Shown when the phone number isn't registered — collects a name, verifies the
// phone with a WhatsApp code, and only then opens the account.
export default function SignupPrompt({ phone, onBack }) {
  const [name, setName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
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

  if (verifying) {
    return (
      <SignupCodeStep
        phone={phone}
        payload={{ contactName: name.trim() }}
        onDone={() => setDone(true)}
        onBack={() => setVerifying(false)}
      />
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
      <Button type="submit" disabled={!name.trim()} className="w-full gap-3 h-14 rounded-full text-base font-medium">
        המשך לאימות בוואטסאפ
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