import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Loader2, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import SendConfirmDialog from "@/components/recordings/SendConfirmDialog";
import useSendRecording from "@/hooks/useSendRecording";
import { PAGE_SIZE } from "@/lib/recordingUtils";

export default function History() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const listRef = useRef(recordings);
  listRef.current = recordings;

  const { sendingId, pending, setPending, send } = useSendRecording((id) =>
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, sent: true, sentAt: new Date().toISOString() } : r)))
  );

  const load = useCallback(async (reset) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const query = {};
      if (!reset) {
        const last = listRef.current[listRef.current.length - 1]?.callDate;
        if (last) query.callDate = { $lt: last };
      }
      const data = (await base44.entities.CallRecording.filter(query, "-callDate", PAGE_SIZE)) || [];
      setHasMore(data.length === PAGE_SIZE);
      setRecordings((prev) => (reset ? data : [...prev, ...data]));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
          חזרה לחיפוש
        </Link>

        <h1 className="font-heading mt-6 text-2xl sm:text-3xl font-bold tracking-tight">כל ההקלטות</h1>
        <p className="mt-2 text-sm text-muted-foreground">כל השיחות לפי סדר כרונולוגי — מהחדשה לישנה.</p>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            טוענים שיחות...
          </div>
        ) : recordings.length === 0 ? (
          <p className="py-20 text-muted-foreground text-sm">אין שיחות להצגה</p>
        ) : (
          <>
            <div className="hidden md:block mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-right">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">מתקשר</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">מספר</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">משך</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">תאריך</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground">תאריך שליחה</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">פעולה</th>
                  </tr>
                </thead>
                <tbody>
                  {recordings.map((r) => (
                    <RecordingRow key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden mt-8 space-y-3.5">
              {recordings.map((r) => (
                <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" disabled={loadingMore} onClick={() => load(false)} className="gap-2 rounded-lg border border-border bg-card hover:bg-accent shadow-none text-sm">
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  טען עוד
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <SendConfirmDialog
        recording={pending}
        sending={pending && sendingId === pending.id}
        onConfirm={(message) => pending && send(pending.id, message)}
        onClose={() => setPending(null)}
      />
    </div>
  );
}