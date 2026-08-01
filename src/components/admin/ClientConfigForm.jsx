import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, X } from "lucide-react";

const EMPTY = { clientName: "", accountNumber: "", clientPhone: "", exmToken: "", greenInstanceId: "", greenToken: "", transcriptEnabled: false };

export default function ClientConfigForm({ initial, onDone, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.exmToken.trim()) return setError("חובה להזין טוקן EXM");
    if (!form.clientPhone.trim()) return setError("חובה להזין טלפון לקוח");
    if (!form.accountNumber.trim()) return setError("חובה להזין ח.פ העסק");
    setSaving(true);
    try {
      const payload = {
        clientName: form.clientName.trim(),
        accountNumber: form.accountNumber.trim(),
        clientPhone: form.clientPhone.trim(),
        exmToken: form.exmToken.trim(),
        greenInstanceId: form.greenInstanceId.trim(),
        greenToken: form.greenToken.trim(),
        transcriptEnabled: !!form.transcriptEnabled
      };
      if (initial?.id) {
        await base44.entities.UserSettings.update(initial.id, payload);
      } else {
        const created = await base44.entities.UserSettings.create(payload);
        // New client — send the Echo welcome message on WhatsApp.
        const res = await base44.functions.invoke("sendClientWelcome", {
          configId: created.id,
          loginUrl: `${window.location.origin}/client-login`
        });
        if (!res.data?.success) setError(`הלקוח נשמר, אך הודעת הפתיחה לא נשלחה (${res.data?.error || "שגיאה"})`);
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (id, label, key, placeholder) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">{label}</Label>
      <Input
        id={id}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        dir="ltr"
        className="h-10 rounded-lg border border-border bg-card font-mono text-sm focus-visible:ring-0 focus-visible:border-primary/50"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4 space-y-4 text-right">
      <div className="grid sm:grid-cols-2 gap-4">
        {field("cname", "שם הלקוח", "clientName", "עסק לדוגמה")}
        {field("acc", "ח.פ העסק (מזהה כניסה)", "accountNumber", "512345678")}
        {field("cphone", "טלפון הלקוח (לקוד בוואטסאפ)", "clientPhone", "0501234567")}
        {field("exm", "טוקן EXM", "exmToken", "exm_token")}
        {field("gi", "מזהה מופע Green API", "greenInstanceId", "710722692595")}
        {field("gt", "טוקן Green API", "greenToken", "api_token")}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <Label className="text-xs font-medium text-foreground/80">תמלול שיחות (Gemini)</Label>
          <p className="mt-1 text-xs text-muted-foreground">כשכבוי — הלקוח לא רואה בכלל שהאפשרות קיימת.</p>
        </div>
        <Switch
          checked={!!form.transcriptEnabled}
          onCheckedChange={(v) => setForm((p) => ({ ...p, transcriptEnabled: v }))}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="gap-2 h-10 rounded-full text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמירה
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="gap-2 h-10 rounded-full shadow-none text-sm">
          <X className="w-4 h-4" /> ביטול
        </Button>
      </div>
    </form>
  );
}