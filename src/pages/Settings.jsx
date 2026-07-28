import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Loader2, ShieldCheck, ExternalLink } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";
const EXM_HELP = "https://www.exm.co.il/";
const GREEN_HELP = "https://console.green-api.com/";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [exmToken, setExmToken] = useState("");
  const [greenInstanceId, setGreenInstanceId] = useState("");
  const [greenToken, setGreenToken] = useState("");
  const [existing, setExisting] = useState({ exm: false, green: false });

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.UserSettings.filter({}, "-updated_date", 1);
        const s = rows?.[0];
        if (s) {
          setSettingsId(s.id);
          setExmToken(s.exmToken || "");
          setGreenInstanceId(s.greenInstanceId || "");
          setGreenToken(s.greenToken || "");
          setExisting({ exm: !!s.exmToken, green: !!(s.greenInstanceId && s.greenToken) });
        }
      } catch (e) {
        toast({ title: "שגיאה בטעינת הגדרות", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!exmToken.trim()) {
      toast({ title: "חובה להזין טוקן EXM", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        exmToken: exmToken.trim(),
        greenInstanceId: greenInstanceId.trim(),
        greenToken: greenToken.trim()
      };
      if (settingsId) {
        await base44.entities.UserSettings.update(settingsId, payload);
      } else {
        const created = await base44.entities.UserSettings.create(payload);
        setSettingsId(created.id);
      }
      setExisting({ exm: !!payload.exmToken, green: !!(payload.greenInstanceId && payload.greenToken) });
      toast({ title: "ההגדרות נשמרו בהצלחה" });
    } catch (err) {
      toast({ title: "שגיאה בשמירה", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const mask = (v) => (v ? `${"•".repeat(Math.max(0, v.length - 4))}${v.slice(-4)}` : "");

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top bar */}
        <div className="relative flex items-center justify-center mb-10">
          <img src={LOGO} alt="echo" className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute left-0 inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-8 text-right">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">הגדרות חיבור</h1>
          <p className="mt-3 text-sm text-muted-foreground">הזינו את פרטי ה-API האישיים שלכם</p>
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            הפרטים מאוחסנים אצלכם בלבד ומוגנים — כל משתמש רואה רק את ההקלטות וההגדרות של עצמו.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="exm" className="text-sm font-medium text-foreground/80">טוקן EXM API</Label>
              <Input
                id="exm"
                value={exmToken}
                onChange={(e) => setExmToken(e.target.value)}
                placeholder="paste_token_here"
                dir="ltr"
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
              <a href={EXM_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                איך מוצאים את הטוקן ב-EXM <ExternalLink className="w-3 h-3" />
              </a>
              {existing.exm && <p className="text-xs text-muted-foreground">נשמר כעת: {mask(exmToken)}</p>}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="gi" className="text-sm font-medium text-foreground/80">מזהה מופע · Green API</Label>
              <Input
                id="gi"
                value={greenInstanceId}
                onChange={(e) => setGreenInstanceId(e.target.value)}
                placeholder="710722692595"
                dir="ltr"
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="gt" className="text-sm font-medium text-foreground/80">טוקן API · Green API</Label>
              <Input
                id="gt"
                value={greenToken}
                onChange={(e) => setGreenToken(e.target.value)}
                placeholder="api_token_here"
                dir="ltr"
                className="h-11 rounded-lg border border-border bg-card font-mono focus-visible:ring-0 focus-visible:border-primary/50"
              />
              <a href={GREEN_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                איך מוצאים את הפרטים ב-Green API <ExternalLink className="w-3 h-3" />
              </a>
              {existing.green && <p className="text-xs text-muted-foreground">נשמר כעת: {mask(greenToken)}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2 h-11 rounded-lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                שמור הגדרות
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="gap-2 h-11 rounded-lg border border-border bg-card hover:bg-accent shadow-none">
                <ArrowRight className="w-4 h-4" /> חזרה לרשימה
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}