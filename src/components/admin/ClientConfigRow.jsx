import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, CheckCircle2, XCircle, ShieldCheck, MessageCircle } from "lucide-react";
import CreateLoginAccount from "@/components/admin/CreateLoginAccount";

export default function ClientConfigRow({ config, onEdit, onChanged }) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const validate = async () => {
    setChecking(true);
    setResult(null);
    try {
      const exm = await base44.functions.invoke("validateExmToken", { token: config.exmToken });
      let green = { data: { valid: null } };
      if (config.greenInstanceId && config.greenToken) {
        green = await base44.functions.invoke("validateGreenApi", {
          instanceId: config.greenInstanceId,
          apiToken: config.greenToken
        });
      }
      setResult({ exm: exm.data?.valid, green: green.data?.valid });
    } catch (e) {
      setResult({ exm: false, green: false });
    } finally {
      setChecking(false);
    }
  };

  const [welcome, setWelcome] = useState(null);
  const [sendingWelcome, setSendingWelcome] = useState(false);

  const sendWelcome = async () => {
    setSendingWelcome(true);
    setWelcome(null);
    try {
      const res = await base44.functions.invoke("sendClientWelcome", {
        configId: config.id,
        loginUrl: `${window.location.origin}/client-login`
      });
      setWelcome(res.data?.success ? { ok: true } : { error: res.data?.error || "שליחה נכשלה" });
    } catch (e) {
      setWelcome({ error: e.message });
    } finally {
      setSendingWelcome(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await base44.entities.UserSettings.delete(config.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const badge = (label, ok) => (
    <span className={`inline-flex items-center gap-1.5 text-xs ${ok ? "text-primary" : "text-destructive"}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-right">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{config.clientName || "ללא שם"}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">
            #{config.accountNumber || "—"} · {config.clientPhone || "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(config)} className="gap-1.5 h-8 rounded-full shadow-none text-xs">
            <Pencil className="w-3.5 h-3.5" /> עריכה
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={remove} className="h-8 w-8 p-0 rounded-full shadow-none text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>EXM: {config.exmToken ? "מוגדר" : "חסר"}</span>
        <span>Green API: {config.greenInstanceId && config.greenToken ? "מוגדר" : "חסר"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" disabled={checking} onClick={validate} className="gap-1.5 h-8 rounded-full shadow-none text-xs">
          {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          בדיקת חיבורים
        </Button>
        <Button variant="outline" size="sm" disabled={sendingWelcome} onClick={sendWelcome} className="gap-1.5 h-8 rounded-full shadow-none text-xs">
          {sendingWelcome ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
          שליחת הודעת פתיחה
        </Button>
        {result?.exm !== undefined && badge("EXM", result.exm)}
        {result?.green !== undefined && result.green !== null && badge("Green API", result.green)}
        {welcome?.ok && <span className="text-xs text-primary">ההודעה נשלחה</span>}
        {welcome?.error && <span className="text-xs text-destructive">{welcome.error}</span>}
      </div>

      <CreateLoginAccount config={config} onDone={onChanged} />
    </div>
  );
}