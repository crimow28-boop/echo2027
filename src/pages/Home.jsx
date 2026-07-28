import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { PhoneIncoming, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import RecordingFilters from "@/components/recordings/RecordingFilters";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import { buildQuery, DEFAULT_FILTERS, PAGE_SIZE } from "@/lib/recordingUtils";

export default function Home() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { toast } = useToast();

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const searchRef = useRef(debouncedSearch);
  searchRef.current = debouncedSearch;
  const recordingsRef = useRef(recordings);
  recordingsRef.current = recordings;

  // Debounce free-text search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 450);
    return () => clearTimeout(t);
  }, [filters.search]);

  const loadRecordings = useCallback(async (reset) => {
    if (reset) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const effectiveFilters = { ...filtersRef.current, search: searchRef.current };
      const query = buildQuery(effectiveFilters);
      if (!reset) {
        const list = recordingsRef.current;
        const last = list.length > 0 ? list[list.length - 1].callDate : null;
        if (last) query.callDate = { ...(query.callDate || {}), $lt: last };
      }
      const data = await base44.entities.CallRecording.filter(query, "-callDate", PAGE_SIZE);
      const list = data || [];
      setHasMore(list.length === PAGE_SIZE);
      setRecordings((prev) => (reset ? list : [...prev, ...list]));
    } catch (error) {
      toast({ title: "שגיאה בטעינת הקלטות", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  // Reload when any filter changes
  useEffect(() => {
    loadRecordings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.callType, filters.sent, filters.fromDate, filters.toDate, debouncedSearch]);

  // Live updates: refresh the list when recordings change in the database
  useEffect(() => {
    const unsubscribe = base44.entities.CallRecording.subscribe(() => {
      loadRecordings(true);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-6">
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

        <RecordingFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          resultCount={recordings.length}
          loading={loading}
        />

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
                <RecordingRow key={r.id} recording={r} sendingId={sendingId} onSend={handleSend} />
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
            <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={handleSend} />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && recordings.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" disabled={loadingMore} onClick={() => loadRecordings(false)} className="gap-2">
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              טען עוד
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}