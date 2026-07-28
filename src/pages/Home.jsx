import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { PhoneIncoming, Loader2, ChevronDown, RefreshCw, Download, Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadRecordingsCsv } from "@/lib/exportRecordings";
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
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { toast } = useToast();

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const searchRef = useRef(debouncedSearch);
  searchRef.current = debouncedSearch;
  const recordingsRef = useRef(recordings);
  recordingsRef.current = recordings;
  const inFlightRef = useRef(false);
  const reloadTimerRef = useRef(null);

  // Debounce free-text search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 450);
    return () => clearTimeout(t);
  }, [filters.search]);

  const loadRecordings = useCallback(async (reset) => {
    if (reset && inFlightRef.current) return;
    inFlightRef.current = true;
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
      inFlightRef.current = false;
    }
  }, [toast]);

  // Reload when search changes
  useEffect(() => {
    loadRecordings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Live updates: refresh the list when recordings change in the database.
  // Debounce burst events (e.g. bulkCreate during sync) into a single reload.
  useEffect(() => {
    const unsubscribe = base44.entities.CallRecording.subscribe(() => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => loadRecordings(true), 800);
    });
    return () => {
      unsubscribe();
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRecordings]);

  // Load the user's integration settings once on entry.
  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.UserSettings.filter({}, "-updated_date", 1);
        setHasSettings(!!rows?.[0]?.exmToken);
      } catch (_e) {
        setHasSettings(false);
      } finally {
        setSettingsLoaded(true);
      }
    })();
  }, []);

  const handleSend = async (recordId) => {
    setSendingId(recordId);
    try {
      const response = await base44.functions.invoke("sendRecordingToClient", { recordId });
      if (response.data?.success) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === recordId ? { ...r, sent: true, sentAt: new Date().toISOString() } : r))
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke("syncRecordings", {});
      if (response.data?.success) {
        toast({
          title: `סונכרנו ${response.data.total} הקלטות`,
          description: `${response.data.created} חדשות · ${response.data.updated} עודכנו`
        });
      } else {
        throw new Error(response.data?.error || "סנכרון נכשל");
      }
    } catch (error) {
      if (error.message !== "NO_SETTINGS") {
        toast({ title: "שגיאה בסנכרון", description: error.message, variant: "destructive" });
      }
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync from exm once on entry (only after the user's EXM token is set).
  useEffect(() => {
    if (hasSettings) handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSettings]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke("exportRecordings", {});
      if (response.data?.success) {
        downloadRecordingsCsv(response.data.rows);
        toast({ title: `יוצאו ${response.data.count} הקלטות` });
      } else {
        throw new Error(response.data?.error || "ייצוא נכשל");
      }
    } catch (error) {
      toast({ title: "שגיאה בייצוא", description: error.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-foreground pb-3 mb-6">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">CALLECT // RECORDINGS</span>
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">{recordings.length} REC</span>
        </div>

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-none">הקלטות שיחות</h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">ניהול · ארגון · שליחה ללקוחות</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={handleExport} disabled={exporting} variant="outline" className="gap-2 rounded-none border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background shadow-none font-mono text-[11px] uppercase tracking-wider">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">ייצוא</span>
            </Button>
            <Button onClick={handleSync} disabled={syncing || !hasSettings} className="gap-2 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-none hover:bg-foreground hover:text-background font-mono text-[11px] uppercase tracking-wider">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="hidden sm:inline">סנכרון</span>
            </Button>
            <Button asChild variant="outline" className="gap-2 rounded-none border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background shadow-none font-mono text-[11px] uppercase tracking-wider">
              <Link to="/settings">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">הגדרות</span>
              </Link>
            </Button>
          </div>
        </header>

        {settingsLoaded && !hasSettings && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 border-2 border-amber-400 p-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="font-mono text-xs leading-relaxed text-amber-700">
                <p className="uppercase tracking-wider font-bold">חיבור נדרש</p>
                <p className="text-amber-600 mt-1">כדי לסנכרן ולשלוח הקלטות, יש להזין את טוקן ה-EXM ופרטי Green API.</p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-2 rounded-none border-2 border-amber-500 bg-amber-400 text-foreground shadow-none hover:bg-amber-300 hover:text-foreground font-mono text-[11px] uppercase tracking-wider">
              <Link to="/onboarding">[ להגדרה → ]</Link>
            </Button>
          </div>
        )}

        <RecordingFilters
          filters={filters}
          onChange={handleFilterChange}
          resultCount={recordings.length}
          loading={loading}
        />

        {/* Table - Desktop */}
        <div className="hidden md:block border-2 border-foreground bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b-2 border-foreground">
              <tr className="text-right">
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">מתקשר</th>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">מספר</th>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">משך</th>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">תאריך</th>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">תאריך שליחה</th>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium text-center">פעולה</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground font-mono text-xs uppercase tracking-wider">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    טוען הקלטות...
                  </td>
                </tr>
              )}
              {!loading && recordings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground font-mono text-xs uppercase tracking-wider">
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
        <div className="md:hidden space-y-3.5">
          {loading && (
            <div className="text-center py-16 text-muted-foreground font-mono text-xs uppercase tracking-wider">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              טוען הקלטות...
            </div>
          )}
          {!loading && recordings.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-mono text-xs uppercase tracking-wider">אין הקלטות להצגה</div>
          )}
          {!loading && recordings.map((r) => (
            <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={handleSend} />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && recordings.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" disabled={loadingMore} onClick={() => loadRecordings(false)} className="gap-2 rounded-none border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background shadow-none font-mono text-[11px] uppercase tracking-wider">
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              טען עוד
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}