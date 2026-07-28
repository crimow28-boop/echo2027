import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronDown, RefreshCw, Download, Settings as SettingsIcon, ShieldAlert, Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadRecordingsCsv } from "@/lib/exportRecordings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import SendConfirmDialog from "@/components/recordings/SendConfirmDialog";
import SearchSummary from "@/components/recordings/SearchSummary";
import TypewriterPlaceholder from "@/components/recordings/TypewriterPlaceholder";
import { buildQuery, DEFAULT_FILTERS, PAGE_SIZE, SEARCH_SUGGESTIONS, formatPhoneDisplay } from "@/lib/recordingUtils";
import { buildSearchExamples } from "@/lib/searchExamples";

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
  const [hasGreen, setHasGreen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState(SEARCH_SUGGESTIONS);
  const [examples, setExamples] = useState([]);
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
        setHasGreen(!!(rows?.[0]?.greenInstanceId && rows?.[0]?.greenToken));
      } catch (_e) {
        setHasSettings(false);
      } finally {
        setSettingsLoaded(true);
      }
    })();
  }, []);

  // Build search suggestions from the user's most recent recordings (real data).
  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.CallRecording.filter({}, "-callDate", 30);
        setExamples(buildSearchExamples(rows));
        const seen = new Set();
        const list = [];
        for (const r of rows || []) {
          const name = (r.callerFriendly || "").trim();
          const number = (r.callerNumber || "").trim();
          const key = name || number;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          list.push({
            key,
            label: name || formatPhoneDisplay(number),
            hint: name ? "איש קשר" : "מספר טלפון",
          });
          if (list.length >= 5) break;
        }
        if (list.length > 0) setSuggestions(list);
      } catch (_e) {
        // keep static fallback suggestions
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
      const raw = error?.response?.data?.error || error?.message || "שליחה נכשלה";
      const friendly =
        raw === "NO_GREEN_API" ? "Green API אינו מוגדר — הגדירו אותו בהגדרות"
        : raw === "NO_SETTINGS" ? "חסרות הגדרות חיבור — הגדירו אותן בהגדרות"
        : raw;
      toast({ title: "שגיאה בשליחה", description: friendly, variant: "destructive" });
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
        <div className="relative flex items-center justify-center mb-12">
          <img
            src="https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png"
            alt="echo"
            className="h-11 w-auto"
          />
          <div className="absolute left-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onClick={handleSync} disabled={syncing || !hasSettings}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>סנכרון הקלטות</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>ייצוא ל-CSV</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    <span>הגדרות</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {settingsLoaded && hasSettings && !hasGreen && (
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm leading-relaxed text-amber-800">
                <p className="font-medium">חסר חיבור WhatsApp</p>
                <p className="text-amber-700 mt-1">כדי לשלוח הקלטות ללקוחות, יש להזין את פרטי Green API.</p>
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
          <p className="mt-3 text-sm text-muted-foreground">כתבו בחופשיות — שם איש קשר, מספר טלפון או טווח תאריכים</p>
          <div className="relative mt-8 max-w-xl">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder=""
              dir="auto"
              className="pr-12 h-14 text-base rounded-2xl border border-border bg-card shadow-sm focus-visible:ring-0 focus-visible:border-primary/50"
            />
            {filters.search.length === 0 && examples.length > 0 && (
              <TypewriterPlaceholder examples={examples} />
            )}
          </div>
          {!hasSearch && (
            <div className="mt-8 max-w-xl">
              {examples.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground/80">אפשר לבקש כך:</p>
                  <div className="mt-2.5 flex flex-col gap-2">
                    {examples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, search: ex }))}
                        className="text-right rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-foreground/80">אפשר לחפש לפי:</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.key || s.label}
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, search: s.label }))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent hover:border-primary/30 transition-colors"
                      >
                        <span>{s.label}</span>
                        <span className="text-xs text-muted-foreground">· {s.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {hasSearch ? (
          <div className="mt-8">
            <SearchSummary search={debouncedSearch} />
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
                        <p>אין שיחות כאלה</p>
                        <p className="mt-1 text-xs text-muted-foreground/80">נסו שם אחר, מספר טלפון או טווח תאריכים אחר</p>
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
                  <p>אין שיחות כאלה</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">נסו שם אחר, מספר טלפון או טווח תאריכים אחר</p>
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
        ) : null}
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