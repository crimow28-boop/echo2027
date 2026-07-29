import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, CheckCircle2, Building2, User, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoginField from "@/components/auth/LoginField";

export default function RequestAccountDialog({ open, onOpenChange }) {
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

  const close = (o) => {
    onOpenChange(o);
    if (!o) {
      setDone(false);
      setError("");
      setForm({ businessName: "", contactName: "", phone: "", notes: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent dir="rtl" className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle className="font-heading text-xl">פתיחת חשבון חדש</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <p className="text-sm font-medium">הבקשה נשלחה</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ניצור איתכם קשר בוואטסאפ עם מספר החשבון ופרטי הכניסה.
            </p>
            <Button onClick={() => close(false)} className="mt-2 h-11 rounded-xl text-sm">סגירה</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              השאירו פרטים ונחזור אליכם עם מספר חשבון לכניסה.
            </p>
            <LoginField id="biz" label="שם העסק" icon={Building2} value={form.businessName} onChange={set("businessName")} placeholder="מוסך אלון" />
            <LoginField id="contact" label="איש קשר" icon={User} value={form.contactName} onChange={set("contactName")} placeholder="ישראל ישראלי" />
            <LoginField id="reqphone" label="טלפון" icon={Phone} value={form.phone} onChange={set("phone")} placeholder="0501234567" />
            <Textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="משהו שכדאי שנדע? (לא חובה)" className="text-sm rounded-xl" />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full gap-2 h-12 rounded-2xl text-base">
              שליחת הבקשה
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}