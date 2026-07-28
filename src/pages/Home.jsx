import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronDown, RefreshCw, Download, Settings as SettingsIcon, ShieldAlert, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadRecordingsCsv } from "@/lib/exportRecordings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import SendConfirmDialog from "@/components/recordings/SendConfirmDialog";
import { buildQuery, DEFAULT_FILTERS, PAGE_SIZE, SEARCH_SUGGESTIONS } from "@/lib/recordingUtils";

export default function Home() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [pending, setPending] = useState(null);
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

  const hasSearch = debouncedSearch.trim().length > 0;

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  const loadRecordings = useCallback(async (reset) => {
    const term = searchRef.current.trim();
    if (!term) {
      if (reset) {
        setRecordings([]);
        setHasMore(false);
      }
      setLoading(false);
      return;
    }
    if (reset && inFlightRef.current) return;
    inFlightRef.current = true;
    if (reset) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const effectiveFilters = { ...filtersRef.current, search: term };
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

  // Reload when the debounced search changes
  useEffect(() => {
    loadRecordings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Live updates: refresh the active search when recordings change in the database.
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
      setPending(null);
    }
  };

  const confirmSend = () => {
    if (pending) handleSend(pending.id);
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

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-12">
          <img
            src="https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/a3b40e436_Screenshot2026-07-28at231744.png"
            alt="echo"
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} disabled={exporting} variant="ghost" size="icon" className="rounded-none shadow-none text-muted-foreground hover:text-foreground hover:bg-transparent h-9 w-9 disabled:opacity-40">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
            <Button onClick={handleSync} disabled={syncing || !hasSettings} variant="ghost" size="icon" className="rounded-none shadow-none text-muted-foreground hover:text-foreground hover:bg-transparent h-9 w-9 disabled:opacity-40">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button asChild variant="ghost" size="icon" className="rounded-none shadow-none text-muted-foreground hover:text-foreground hover:bg-transparent h-9 w-9">
              <Link to="/settings"><SettingsIcon className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>

        {settingsLoaded && !hasSettings && (
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm leading-relaxed text-amber-800">
                <p className="font-medium">חיבור נדרש</p>
                <p className="text-amber-700 mt-1">כדי לסנכרן ולשלוח הקלטות, יש להזין את טוקן ה-EXM ופרטי Green API.</p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-2 rounded-lg border border-amber-300 bg-amber-100 text-amber-800 shadow-none hover:bg-amber-200 text-xs font-medium">
              <Link to="/onboarding">להגדרה →</Link>
            </Button>
          </div>
        )}

        {/* Search hero */}
        <div className="text-right">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">מצאו כל שיחה, ברגע</h1>
          <p className="mt-3 text-sm text-muted-foreground">חפשו בהקלטות לפי שם איש קשר או מספר טלפון</p>
          <div className="relative mt-8 max-w-xl">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="איזו שיחה תרצו למצוא?"
              dir="auto"
              className="pr-12 h-14 text-base rounded-2xl border border-border bg-card shadow-sm focus-visible:ring-0 focus-visible:border-primary/50"
            />
          </div>
          {/* Example suggestions */}
          <div className="mt-5 flex flex-wrap items-center justify-start gap-2">
            <span className="text-xs text-muted-foreground">אפשר לחפש לפי:</span>
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: s.label }))}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <span>{s.label}</span>
                <span className="text-xs text-muted-foreground">· {s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {hasSearch ? (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <span className={`inline-block w-2 h-2 rounded-full ${loading ? "bg-muted-foreground animate-pulse" : "bg-primary"}`}></span>
              {loading ? "מחפשים את השיחות המתאימות..." : `נמצאו ${recordings.length} שיחות`}
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
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
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground text-sm">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        מחפשים את השיחות המתאימות...
                      </td>
                    </tr>
                  )}
                  {!loading && recordings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-right text-muted-foreground text-sm">
                        <p>לא מצאנו שיחות שתואמות לחיפוש</p>
                        <p className="mt-1 text-xs text-muted-foreground/80">נסו לחפש בשם אחר או לבדוק את מספר הטלפון</p>
                      </td>
                    </tr>
                  )}
                  {!loading && recordings.map((r) => (
                    <RecordingRow key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden space-y-3.5">
              {loading && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  מחפשים את השיחות המתאימות...
                </div>
              )}
              {!loading && recordings.length === 0 && (
                <div className="py-16 text-right text-muted-foreground text-sm">
                  <p>לא מצאנו שיחות שתואמות לחיפוש</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">נסו לחפש בשם אחר או לבדוק את מספר הטלפון</p>
                </div>
              )}
              {!loading && recordings.map((r) => (
                <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} />
              ))}
            </div>

            {hasMore && !loading && recordings.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" disabled={loadingMore} onClick={() => loadRecordings(false)} className="gap-2 rounded-lg border border-border bg-card hover:bg-accent shadow-none text-sm">
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  טען עוד
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-16 text-right text-sm text-muted-foreground">
            התחילו בשם או במספר טלפון
          </div>
        )}
      </div>

      <SendConfirmDialog
        recording={pending}
        sending={pending && sendingId === pending.id}
        onConfirm={confirmSend}
        onClose={() => setPending(null)}
      />
    </div>
  );
}