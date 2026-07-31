import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronDown, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import { RecordingRowsSkeleton, RecordingCardsSkeleton } from "@/components/recordings/RecordingSkeletons";
import { PAGE_SIZE } from "@/lib/recordingUtils";

// The call history is revealed in-page as the user scrolls down from the search hero.
const HistoryReveal = React.forwardRef(function HistoryReveal(
  { sendingId, onSend, onHide, isPrivate },
  ref
) {
  const [allRecordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const listRef = useRef(allRecordings);
  listRef.current = allRecordings;
  const recordings = allRecordings.filter((r) => !isPrivate(r.callerNumber));

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 45%"]
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

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

  // Keep rows in sync (e.g. mark as sent right after a send).
  useEffect(() => {
    return base44.entities.CallRecording.subscribe((event) => {
      if (event?.type !== "update" || !event.data?.id) return;
      setRecordings((prev) => prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data } : r)));
    });
  }, []);

  return (
    <section ref={ref} className="mt-24 pb-16">
      <motion.div style={{ opacity, y, scale }} className="origin-top">
        <div className="rounded-[2rem] bg-card p-5 sm:p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-xl font-bold">היסטוריית השיחות</h2>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">כל השיחות מהחדשה לישנה.</p>

          {loading ? (
            <>
              <div className="hidden md:block mt-6 rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm"><tbody><RecordingRowsSkeleton /></tbody></table>
              </div>
              <div className="md:hidden mt-6"><RecordingCardsSkeleton /></div>
            </>
          ) : recordings.length === 0 ? (
            <p className="py-14 text-sm text-muted-foreground">אין שיחות להצגה</p>
          ) : (
            <>
              <div className="hidden md:block mt-6 rounded-xl border border-border overflow-hidden">
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
                      <RecordingRow key={r.id} recording={r} sendingId={sendingId} onSend={onSend} onHide={onHide} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden mt-6 space-y-3.5">
                {recordings.map((r) => (
                  <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={onSend} onHide={onHide} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-7">
                  <Button variant="outline" disabled={loadingMore} onClick={() => load(false)} className="gap-2 shadow-none text-sm">
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                    טען עוד
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
});

export default HistoryReveal;