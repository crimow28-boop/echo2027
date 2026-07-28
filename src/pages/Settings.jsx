import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Loader2, Settings as SettingsIcon, ShieldCheck } from "lucide-react";

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
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-2xl gradient-teal glow-teal-sm flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">הגדרות חיבור</h1>
              <p className="text-sm text-muted-foreground">Callect — הזינו את פרטי ה-API האישיים שלכם</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/60 border border-border rounded-xl p-3">
            <ShieldCheck className="w-4 h-4 text-[#00ffcc] shrink-0 mt-0.5" />
            <span>הפרטים מאוחסנים אצלכם בלבד ומוגנים — כל משתמש רואה רק את ההקלטות וההגדרות של עצמו.</span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="exm">טוקן EXM API</Label>
              <Input id="exm" value={exmToken} onChange={(e) => setExmToken(e.target.value)} placeholder="הדבקו את הטוקן מ-exm.co.il" dir="ltr" />
              {existing.exm && <p className="text-xs text-muted-foreground">נשמר כעת: {mask(exmToken)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gi">Green API — מספר Instance</Label>
              <Input id="gi" value={greenInstanceId} onChange={(e) => setGreenInstanceId(e.target.value)} placeholder="לדוגמה: 710722692595" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gt">Green API — טוקן API</Label>
              <Input id="gt" value={greenToken} onChange={(e) => setGreenToken(e.target.value)} placeholder="apiTokenInstance" dir="ltr" />
              {existing.green && <p className="text-xs text-muted-foreground">נשמר כעת: {mask(greenToken)}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={saving} className="gap-2 border-0 gradient-teal text-primary-foreground glow-teal-sm hover:opacity-90">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                שמור הגדרות
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="gap-2 border-border bg-card/60 hover:bg-accent">
                <ArrowRight className="w-4 h-4" /> חזרה לרשימה
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}