import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DialPad from "@/components/dialer/DialPad";
import DialerContacts from "@/components/dialer/DialerContacts";
import { ArrowRight, Loader2, Phone, PhoneCall } from "lucide-react";

export default function Dialer() {
  const [number, setNumber] = useState("");
  const [client, setClient] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    base44.entities.UserSettings.filter({}, "-updated_date", 1)
      .then((rows) => setClient(rows?.[0] || null))
      .catch(() => {});
  }, []);

  const call = async () => {
    setError("");
    setOk("");
    const digits = number.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("מספר היעד אינו תקין");
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("click2call", { to: number });
      if (!res.data?.success) throw new Error(res.data?.error || "החיוג נכשל");
      setOk("הטלפון שלכם מצלצל — ענו כדי לחבר את השיחה");
      setNumber("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-grid text-foreground font-body px-5 py-10">
      <div className="mx-auto w-full max-w-sm text-right">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-3.5 h-3.5" /> חזרה
        </Link>

        <div className="mt-6">
          <h1 className="font-heading text-3xl tracking-tight">חייגן</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            החיוג מתבצע דרך המרכזייה: קודם יצלצל הטלפון שלכם, וכשתענו תתחבר השיחה ליעד
            {client?.virtualNumber ? " עם המספר הווירטואלי שלכם" : ""}.
          </p>
        </div>

        <div className="mt-6 rounded-[2rem] bg-card p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)] space-y-5">
          <Input
            value={number}
            onChange={(e) => { setError(""); setOk(""); setNumber(e.target.value); }}
            placeholder="0501234567"
            dir="ltr"
            inputMode="tel"
            className="h-14 rounded-2xl border-border bg-muted/40 text-center text-2xl font-mono tracking-widest focus-visible:ring-0 focus-visible:border-primary/50"
          />

          <DialPad
            onPress={(k) => { setError(""); setOk(""); setNumber((p) => p + k); }}
            onBackspace={() => setNumber((p) => p.slice(0, -1))}
          />

          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          {ok && <p className="text-xs text-primary text-center">{ok}</p>}

          <Button onClick={call} disabled={busy || !number} className="w-full gap-3 h-14 rounded-full text-base">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
            חיוג
          </Button>

          {client?.virtualNumber && (
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span dir="ltr" className="font-mono">{client.virtualNumber}</span>
            </p>
          )}
        </div>

        <DialerContacts
          onSelect={(phone) => {
            setError("");
            setOk("");
            setNumber(phone);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}