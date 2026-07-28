import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, ArrowLeft, ExternalLink, ShieldCheck, Phone, Plug } from "lucide-react";

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
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Stepper */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl gradient-teal glow-teal-sm flex items-center justify-center">
            <Plug className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">הגדרת חשבון</h1>
            <p className="text-sm text-muted-foreground">שלב {step} מתוך 2</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleExmNext} className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4">
              <CheckCircle2 className="w-5 h-5 text-[#00ffcc] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">חיבור ל-EXM</p>
                <p className="text-xs text-muted-foreground mt-1">
                  הזינו את טוקן ה-API שלכם מ-EXM כדי שנוכל למשוך את הקלטות השיחות שלכם אוטומטית.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exm">טוקן EXM API</Label>
              <Input
                id="exm"
                value={exmToken}
                onChange={(e) => { setExmToken(e.target.value); setErrorExm(""); }}
                placeholder="הדבקו את הטוקן מ-EXM"
                dir="ltr"
                autoFocus
              />
              <a href={EXM_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#00ffcc] hover:underline">
                איך מוצאים את הטוקן? כניסה למערכת EXM <ExternalLink className="w-3 h-3" />
              </a>
              {errorExm && <p className="text-xs text-destructive">{errorExm}</p>}
            </div>

            <Button type="submit" disabled={validating} className="w-full gap-2 border-0 gradient-teal text-primary-foreground glow-teal-sm hover:opacity-90">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות והמשך"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleGreenFinish} className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4">
              <Phone className="w-5 h-5 text-[#00ffcc] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">חיבור ל-WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-1">
                  הזינו את פרטי המופע מ-Green API כדי שנוכל לשלוח הקלטות ללקוחות ישירות לוואטסאפ.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gi">מזהה המופע (Instance ID)</Label>
              <Input
                id="gi"
                value={greenInstanceId}
                onChange={(e) => { setGreenInstanceId(e.target.value); setErrorGreen(""); }}
                placeholder="לדוגמה: 710722692595"
                dir="ltr"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">מופיע בדאשבורד Green API תחת המופע שלכם, בשדה "idInstance".</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gt">טוקן API (apiTokenInstance)</Label>
              <Input
                id="gt"
                value={greenToken}
                onChange={(e) => { setGreenToken(e.target.value); setErrorGreen(""); }}
                placeholder="apiTokenInstance"
                dir="ltr"
              />
              <a href={GREEN_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#00ffcc] hover:underline">
                איך מוצאים את הפרטים? פתיחת דאשבורד Green API <ExternalLink className="w-3 h-3" />
              </a>
              {errorGreen && <p className="text-xs text-destructive">{errorGreen}</p>}
            </div>

            <Button type="submit" disabled={validating} className="w-full gap-2 border-0 gradient-teal text-primary-foreground glow-teal-sm hover:opacity-90">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {validating ? "מאמת..." : "אימות וסיום"}
            </Button>

            <div className="text-center">
              <button type="button" onClick={handleSkipGreen} disabled={saving} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                {saving ? "שומר..." : "אגדיר את WhatsApp אחר כך"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}