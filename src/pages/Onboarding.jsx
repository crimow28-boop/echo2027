import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Phone, Plug } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/7557abb16_Screenshot2026-07-31at231525-Photoroom.png";
const EXM_HELP = "https://www.exm.co.il/";
const GREEN_HELP = "https://console.green-api.com/";

export default function Onboarding() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [exmToken, setExmToken] = useState("");
  const [greenInstanceId, setGreenInstanceId] = useState("");
  const [greenToken, setGreenToken] = useState("");
  const [existingId, setExistingId] = useState(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorExm, setErrorExm] = useState("");
  const [errorGreen, setErrorGreen] = useState("");
  const [ready, setReady] = useState(false);

  // Load any existing settings; skip ahead / redirect for returning users.
  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.UserSettings.filter({}, "-updated_date", 1);
        const s = rows?.[0];
        if (s) {
          setExistingId(s.id);
          // Tokens are stored encrypted — never prefill them into the form.
          setGreenInstanceId(s.greenInstanceId || "");
          if (s.exmToken && s.greenInstanceId && s.greenToken) {
            window.location.href = "/";
            return;
          }
          if (s.exmToken) setStep(2);
        }
      } catch (_e) {
        // no settings yet — start at step 1
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persistExm = async () => {
    // Saved via the backend so the token is encrypted at rest.
    const res = await base44.functions.invoke("saveClientSettings", {
      ...(existingId ? { id: existingId } : {}),
      data: { exmToken: exmToken.trim() }
    });
    if (!res.data?.success) throw new Error(res.data?.error || "השמירה נכשלה");
    if (!existingId) setExistingId(res.data.id);
  };

  const handleExmNext = async (e) => {
    e.preventDefault();
    setErrorExm("");
    if (!exmToken.trim()) {
      setErrorExm("נדרש טוקן EXM");
      return;
    }
    setValidating(true);
    try {
      const res = await base44.functions.invoke("validateExmToken", { token: exmToken.trim() });
      if (res.data?.valid) {
        await persistExm();
        setStep(2);
      } else {
        setErrorExm(res.data?.error || "הטוקן לא תקין");
      }
    } catch (err) {
      setErrorExm(err.message || "שגיאה באימות");
    } finally {
      setValidating(false);
    }
  };

  const handleGreenFinish = async (e) => {
    e.preventDefault();
    setErrorGreen("");
    if (!greenInstanceId.trim() || !greenToken.trim()) {
      setErrorGreen("יש למלא את מזהה המופע והטוקן");
      return;
    }
    setValidating(true);
    try {
      const res = await base44.functions.invoke("validateGreenApi", {
        instanceId: greenInstanceId.trim(),
        apiToken: greenToken.trim()
      });
      if (res.data?.valid) {
        await finish({
          ...(exmToken.trim() ? { exmToken: exmToken.trim() } : {}),
          greenInstanceId: greenInstanceId.trim(),
          greenToken: greenToken.trim()
        });
      } else {
        setErrorGreen(res.data?.error || "פרטי Green API לא תקינים");
      }
    } catch (err) {
      setErrorGreen(err.message || "שגיאה באימות");
    } finally {
      setValidating(false);
    }
  };

  const handleSkipGreen = async () => {
    setSaving(true);
    try {
      await finish(exmToken.trim() ? { exmToken: exmToken.trim() } : {});
    } catch (err) {
      toast({ title: "שגיאה בשמירה", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const finish = async (payload) => {
    setSaving(true);
    try {
      if (Object.keys(payload).length > 0) {
        const res = await base44.functions.invoke("saveClientSettings", {
          ...(existingId ? { id: existingId } : {}),
          data: payload
        });
        if (!res.data?.success) throw new Error(res.data?.error || "השמירה נכשלה");
      }
      window.location.href = "/";
    } catch (err) {
      setSaving(false);
      throw err;
    }
  };

  if (!ready) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-center mb-10">
          <img src={LOGO} alt="echo" className="h-10 w-auto" />
        </div>

        {/* Heading + progress */}
        <div className="mb-10 text-right">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">הגדרת חשבון</h1>
          <p className="mt-3 text-sm text-muted-foreground">חיבור שירותים — שלב {step} מתוך 2</p>
          <div className="mt-6 flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`}></div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleExmNext} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Plug className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground/80">חיבור ל-EXM</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                הזינו את טוקן ה-API שלכם מ-EXM כדי שנוכל למשוך את הקלטות השיחות שלכם אוטומטית.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="exm" className="text-sm font-medium text-foreground/80">טוקן EXM API</Label>
              <Input
                id="exm"
                value={exmToken}
                onChange={(e) => { setExmToken(e.target.value); setErrorExm(""); }}
                placeholder="paste_token_here"
                dir="ltr"
                autoFocus
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
              <a href={EXM_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                איך מוצאים את הטוקן ב-EXM <ExternalLink className="w-3 h-3" />
              </a>
              {errorExm && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{errorExm}</p>
              )}
            </div>

            <Button type="submit" disabled={validating} className="w-full h-11 rounded-lg">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות והמשך"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleGreenFinish} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground/80">חיבור ל-WhatsApp</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                הזינו את פרטי המופע מ-Green API כדי שנוכל לשלוח הקלטות ללקוחות ישירות לוואטסאפ.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="gi" className="text-sm font-medium text-foreground/80">מזהה המופע · ID Instance</Label>
              <Input
                id="gi"
                value={greenInstanceId}
                onChange={(e) => { setGreenInstanceId(e.target.value); setErrorGreen(""); }}
                placeholder="710722692595"
                dir="ltr"
                autoFocus
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">מופיע בדאשבורד תחת המופע, בשדה idInstance.</p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="gt" className="text-sm font-medium text-foreground/80">טוקן API · apiTokenInstance</Label>
              <Input
                id="gt"
                value={greenToken}
                onChange={(e) => { setGreenToken(e.target.value); setErrorGreen(""); }}
                placeholder="api_token_here"
                dir="ltr"
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
              <a href={GREEN_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                איך מוצאים את הפרטים ב-Green API <ExternalLink className="w-3 h-3" />
              </a>
              {errorGreen && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{errorGreen}</p>
              )}
            </div>

            <Button type="submit" disabled={validating} className="w-full h-11 rounded-lg">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות וסיום"}
            </Button>

            <div className="text-center pt-2">
              <button type="button" onClick={handleSkipGreen} disabled={saving} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {saving ? "שומר..." : "אגדיר את WhatsApp אחר כך"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}