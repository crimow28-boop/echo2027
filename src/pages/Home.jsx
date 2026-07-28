import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { PhoneIncoming, PhoneOutgoing, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const { toast } = useToast();

  const loadRecordings = useCallback(async () => {
    try {
      const data = await base44.entities.CallRecording.list("-created_date");
      setRecordings(data || []);
    } catch (error) {
      toast({ title: "שגיאה בטעינת הקלטות", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const handleSend = async (recordId) => {
    setSendingId(recordId);
    try {
      const response = await base44.functions.invoke("sendRecordingToClient", { recordId });
      if (response.data?.success) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === recordId ? { ...r, sent: true } : r))
        );
        toast({ title: "ההקלטה נשלחה ללקוח בהצלחה" });
      } else {
        throw new Error(response.data?.error || "שליחה נכשלה");
      }
    } catch (error) {
      toast({ title: "שגיאה בשליחה", description: error.message, variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PhoneIncoming className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">הקלטות שיחות</h1>
              <p className="text-sm text-muted-foreground">Callect — ניהול הקלטות שיחות</p>
            </div>
          </div>
        </header>

        {/* Table - Desktop */}
        <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-right">
                <th className="px-4 py-3 font-medium text-muted-foreground">מתקשר</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">מספר</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">סוג</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">משך</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">תאריך</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-center">פעולה</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    טוען הקלטות...
                  </td>
                </tr>
              )}
              {!loading && recordings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    אין הקלטות להצגה
                  </td>
                </tr>
              )}
              {!loading && recordings.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.callerFriendly || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs" dir="ltr">{r.callerNumber || "—"}</td>
                  <td className="px-4 py-3">
                    {r.callType === "outgoing" ? (
                      <span className="inline-flex items-center gap-1.5 text-blue-400">
                        <PhoneOutgoing className="w-4 h-4" />
                        יוצאת
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <PhoneIncoming className="w-4 h-4" />
                        נכנסת
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono" dir="ltr">{formatDuration(r.duration)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(r.callDate || r.created_date)}</td>
                  <td className="px-4 py-3">
                    {r.sent ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        נשלח
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs">
                        <Clock className="w-4 h-4" />
                        ממתין
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant={r.sent ? "secondary" : "default"}
                      disabled={r.sent || sendingId === r.id}
                      onClick={() => handleSend(r.id)}
                      className="gap-1.5"
                    >
                      {sendingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      שלח ללקוח
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {loading && (
            <div className="text-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              טוען הקלטות...
            </div>
          )}
          {!loading && recordings.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">אין הקלטות להצגה</div>
          )}
          {!loading && recordings.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{r.callerFriendly || "—"}</div>
                  <div className="text-xs text-muted-foreground font-mono" dir="ltr">{r.callerNumber || "—"}</div>
                </div>
                {r.callType === "outgoing" ? (
                  <span className="inline-flex items-center gap-1 text-blue-400 text-xs">
                    <PhoneOutgoing className="w-3.5 h-3.5" /> יוצאת
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                    <PhoneIncoming className="w-3.5 h-3.5" /> נכנסת
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono" dir="ltr">{formatDuration(r.duration)}</span>
                <span>{formatDate(r.callDate || r.created_date)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                {r.sent ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4" /> נשלח
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs">
                    <Clock className="w-4 h-4" /> ממתין
                  </span>
                )}
                <Button
                  size="sm"
                  variant={r.sent ? "secondary" : "default"}
                  disabled={r.sent || sendingId === r.id}
                  onClick={() => handleSend(r.id)}
                  className="gap-1.5"
                >
                  {sendingId === r.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  שלח
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}