import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Loader2, Settings as SettingsIcon, ShieldCheck, ExternalLink } from "lucide-react";

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
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-foreground pb-3 mb-8">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">CALLECT // SETTINGS</span>
          <SettingsIcon className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-none">הגדרות חיבור</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">הזינו את פרטי ה-API האישיים שלכם</p>
        </div>

        <div className="flex items-start gap-3 border-2 border-foreground p-4 mb-8">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
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
              <Label htmlFor="exm" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">טוקן EXM API</Label>
              <Input
                id="exm"
                value={exmToken}
                onChange={(e) => setExmToken(e.target.value)}
                placeholder="paste_token_here"
                dir="ltr"
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
              <a href={EXM_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline">
                [ → איך מוצאים את הטוקן — EXM ] <ExternalLink className="w-3 h-3" />
              </a>
              {existing.exm && <p className="font-mono text-[11px] text-muted-foreground">נשמר כעת: {mask(exmToken)}</p>}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="gi" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">מזהה מופע · GREEN API</Label>
              <Input
                id="gi"
                value={greenInstanceId}
                onChange={(e) => setGreenInstanceId(e.target.value)}
                placeholder="710722692595"
                dir="ltr"
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="gt" className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">טוקן API · GREEN API</Label>
              <Input
                id="gt"
                value={greenToken}
                onChange={(e) => setGreenToken(e.target.value)}
                placeholder="api_token_here"
                dir="ltr"
                className="rounded-none font-mono border-2 border-foreground bg-transparent h-12 focus-visible:ring-0 focus-visible:border-primary"
              />
              <a href={GREEN_HELP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline">
                [ → איך מוצאים את הפרטים — GREEN API ] <ExternalLink className="w-3 h-3" />
              </a>
              {existing.green && <p className="font-mono text-[11px] text-muted-foreground">נשמר כעת: {mask(greenToken)}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-none hover:bg-foreground hover:text-background font-mono text-sm uppercase tracking-[0.15em]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                שמור הגדרות
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="gap-2 rounded-none border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background shadow-none font-mono text-sm uppercase tracking-[0.15em]">
                <ArrowRight className="w-4 h-4" /> חזרה לרשימה
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}