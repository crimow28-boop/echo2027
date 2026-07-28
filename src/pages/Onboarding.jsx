import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Phone, Plug } from "lucide-react";

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
          setExmToken(s.exmToken || "");
          setGreenInstanceId(s.greenInstanceId || "");
          setGreenToken(s.greenToken || "");
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
    const payload = { exmToken: exmToken.trim() };
    if (existingId) {
      await base44.entities.UserSettings.update(existingId, payload);
    } else {
      const created = await base44.entities.UserSettings.create(payload);
      setExistingId(created.id);
    }
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
        await finish({ exmToken: exmToken.trim(), greenInstanceId: greenInstanceId.trim(), greenToken: greenToken.trim() });
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
      await finish({ exmToken: exmToken.trim() });
    } catch (err) {
      toast({ title: "שגיאה בשמירה", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const finish = async (payload) => {
    setSaving(true);
    try {
      if (existingId) {
        await base44.entities.UserSettings.update(existingId, payload);
      } else {
        await base44.entities.UserSettings.create(payload);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-foreground pb-3 mb-10">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">CALLECT // ONBOARDING</span>
          <span className="font-mono text-sm font-bold text-primary">0{step}/02</span>
        </div>

        {/* Big heading + progress blocks */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-none">הגדרת חשבון</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            חיבור שירותים — שלב {step} מתוך 2
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className={`h-8 border-2 border-foreground flex items-center justify-center font-mono text-[11px] uppercase tracking-wider ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}>
              01 · EXM
            </div>
            <div className={`h-8 border-2 border-foreground flex items-center justify-center font-mono text-[11px] uppercase tracking-wider ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}>
              02 · WhatsApp
            </div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleExmNext} className="space-y-6">
            <div className="border-2 border-foreground p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <Plug className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">חיבור ל-EXM</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                הזינו את טוקן ה-API שלכם מ-EXM כדי שנוכל למשוך את הקלטות השיחות שלכם אוטומטית.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="exm" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">טוקן EXM API</Label>
              <Input
                id="exm"
                value={exmToken}
                onChange={(e) => { setExmToken(e.target.value); setErrorExm(""); }}
                placeholder="paste_token_here"
                dir="ltr"
                autoFocus
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
              <a href={EXM_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline">
                [ → איך מוצאים את הטוקן — EXM ] <ExternalLink className="w-3 h-3" />
              </a>
              {errorExm && (
                <p className="border-2 border-destructive px-3 py-2 font-mono text-xs text-destructive">{errorExm}</p>
              )}
            </div>

            <Button type="submit" disabled={validating} className="w-full rounded-none border-2 border-foreground bg-primary text-primary-foreground h-12 font-mono text-sm uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות והמשך"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleGreenFinish} className="space-y-6">
            <div className="border-2 border-foreground p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">חיבור ל-WhatsApp</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                הזינו את פרטי המופע מ-Green API כדי שנוכל לשלוח הקלטות ללקוחות ישירות לוואטסאפ.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="gi" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">מזהה המופע · ID INSTANCE</Label>
              <Input
                id="gi"
                value={greenInstanceId}
                onChange={(e) => { setGreenInstanceId(e.target.value); setErrorGreen(""); }}
                placeholder="710722692595"
                dir="ltr"
                autoFocus
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
              <p className="font-mono text-[11px] text-muted-foreground">מופיע בדאשבורד תחת המופע, בשדה idInstance.</p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="gt" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">טוקן API · APITOKENINSTANCE</Label>
              <Input
                id="gt"
                value={greenToken}
                onChange={(e) => { setGreenToken(e.target.value); setErrorGreen(""); }}
                placeholder="api_token_here"
                dir="ltr"
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
              <a href={GREEN_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline">
                [ → איך מוצאים את הפרטים — GREEN API ] <ExternalLink className="w-3 h-3" />
              </a>
              {errorGreen && (
                <p className="border-2 border-destructive px-3 py-2 font-mono text-xs text-destructive">{errorGreen}</p>
              )}
            </div>

            <Button type="submit" disabled={validating} className="w-full rounded-none border-2 border-foreground bg-primary text-primary-foreground h-12 font-mono text-sm uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות וסיום"}
            </Button>

            <div className="text-center border-t-2 border-dashed border-border pt-5">
              <button type="button" onClick={handleSkipGreen} disabled={saving} className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:underline">
                [ {saving ? "שומר..." : "אגדיר את WhatsApp אחר כך"} → ]
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}