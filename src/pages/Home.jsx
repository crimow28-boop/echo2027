import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronDown, RefreshCw, Download, Settings as SettingsIcon, ShieldAlert, Search, Menu, Lightbulb, Phone, User, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadRecordingsCsv } from "@/lib/exportRecordings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppMenuSheet from "@/components/AppMenuSheet";
import { useToast } from "@/components/ui/use-toast";
import RecordingRow from "@/components/recordings/RecordingRow";
import RecordingCard from "@/components/recordings/RecordingCard";
import SendConfirmDialog from "@/components/recordings/SendConfirmDialog";
import SearchSummary from "@/components/recordings/SearchSummary";
import TypewriterPlaceholder from "@/components/recordings/TypewriterPlaceholder";
import { buildQuery, DEFAULT_FILTERS, PAGE_SIZE, SEARCH_SUGGESTIONS, formatPhoneDisplay } from "@/lib/recordingUtils";
import { buildSearchExamples } from "@/lib/searchExamples";
import { RecordingRowsSkeleton, RecordingCardsSkeleton } from "@/components/recordings/RecordingSkeletons";
import useIsSystemAdmin from "@/hooks/useIsSystemAdmin";
import usePrivateContacts from "@/hooks/usePrivateContacts";
import HideContactDialog from "@/components/recordings/HideContactDialog";
import HistoryReveal from "@/components/home/HistoryReveal";

export default function Home() {
  const [allRecordings, setRecordings] = useState([]);
  const { isPrivate, hide } = usePrivateContacts();
  const [hidePending, setHidePending] = useState(null);
  const [hiding, setHiding] = useState(false);
  const recordings = allRecordings.filter((r) => !isPrivate(r.callerNumber));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [pending, setPendingState] = useState(null);
  const [sendError, setSendError] = useState("");
  const setPending = (rec) => {
    setSendError("");
    setPendingState(rec);
  };
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [hasGreen, setHasGreen] = useState(false);
  const { isAdmin } = useIsSystemAdmin();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState(SEARCH_SUGGESTIONS);
  const [examples, setExamples] = useState([]);
  const { toast } = useToast();

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const searchRef = useRef(debouncedSearch);
  searchRef.current = debouncedSearch;
  const recordingsRef = useRef(allRecordings);
  recordingsRef.current = allRecordings;

  const confirmHide = async () => {
    setHiding(true);
    try {
      await hide(hidePending);
      setHidePending(null);
    } finally {
      setHiding(false);
    }
  };
  const inFlightRef = useRef(false);
  const reloadTimerRef = useRef(null);
  const historyRef = useRef(null);

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
        const names = [];
        const numbers = [];
        const seen = new Set();
        for (const r of rows || []) {
          const name = (r.callerFriendly || "").trim();
          const number = (r.callerNumber || "").trim();
          if (name && !seen.has(name) && names.length < 3) {
            seen.add(name);
            names.push({ key: name, label: name, hint: "איש קשר" });
          }
          if (number && !seen.has(number) && numbers.length < 2) {
            seen.add(number);
            numbers.push({ key: number, label: formatPhoneDisplay(number), hint: "מספר טלפון" });
          }
        }
        const list = [...names, ...numbers];
        if (list.length > 0) setSuggestions(list);
      } catch (_e) {
        // keep static fallback suggestions
      }
    })();
  }, []);

  const handleSend = async (recordId, message) => {
    setSendingId(recordId);
    setSendError("");
    try {
      const response = await base44.functions.invoke("sendRecordingToClient", { recordId, message });
      if (response.data?.success) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === recordId ? { ...r, sent: true, sentAt: new Date().toISOString() } : r))
        );
        setPendingState(null);
      } else {
        throw new Error(response.data?.error || "שליחה נכשלה");
      }
    } catch (error) {
      const raw = error?.response?.data?.error || error?.message || "שליחה נכשלה";
      const friendly =
        raw === "NO_GREEN_API" ? "Green API אינו מוגדר — פנו לנציג המערכת"
        : raw === "NO_SETTINGS" ? "חסרות הגדרות חיבור — פנו לנציג המערכת"
        : raw;
      setSendError(friendly);
    } finally {
      setSendingId(null);
    }
  };

  const confirmSend = (message) => {
    if (pending) handleSend(pending.id, message);
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

  const handleEnrichNames = async () => {
    setEnriching(true);
    try {
      await base44.functions.invoke("enrichContactNames", {});
      loadRecordings(true);
    } finally {
      setEnriching(false);
    }
  };

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
    <div dir="rtl" className="min-h-screen bg-transparent bg-grid text-foreground font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Top bar */}
        <div className="flex items-start justify-start gap-4 -mt-6 mb-10">
          <div className="shrink-0">
            <AppMenuSheet onExport={handleExport} exporting={exporting} />
          </div>
          {syncing && (
            <span className="inline-flex items-center gap-2 h-9 rounded-full bg-card px-3.5 text-xs text-muted-foreground shadow-[0_2px_10px_-6px_rgba(0,0,0,0.15)] animate-in fade-in duration-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" />
              מסנכרנים שיחות חדשות...
            </span>
          )}
        </div>

        {settingsLoaded && !hasSettings && (
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm leading-relaxed text-amber-800">
                <p className="font-medium">החיבור בהקמה</p>
                <p className="text-amber-700 mt-1">
                  {isAdmin ? "לא הוגדרו חיבורי EXM ו-Green API עבור המשתמש הזה." : "החיבור לשיחות שלכם עוד לא הושלם — נציג המערכת מטפל בזה."}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button asChild size="sm" className="gap-2 rounded-lg border border-amber-300 bg-amber-100 text-amber-800 shadow-none hover:bg-amber-200 text-xs font-medium">
                <Link to="/admin">לניהול לקוחות →</Link>
              </Button>
            )}
          </div>
        )}

        {settingsLoaded && hasSettings && !hasGreen && (
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3 flex-1">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm leading-relaxed text-amber-800">
                <p className="font-medium">חסר חיבור WhatsApp</p>
                <p className="text-amber-700 mt-1">
                  {isAdmin ? "יש להזין את פרטי Green API עבור הלקוח." : "השליחה לוואטסאפ עוד לא זמינה — נציג המערכת מטפל בזה."}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button asChild size="sm" className="gap-2 rounded-lg border border-amber-300 bg-amber-100 text-amber-800 shadow-none hover:bg-amber-200 text-xs font-medium">
                <Link to="/admin">לניהול לקוחות →</Link>
              </Button>
            )}
          </div>
        )}

        {/* Search hero */}
        <div className="text-center">
          <img
            src="https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/023ecb0e1_Screenshot2026-07-31at233007-Photoroom.png"
            alt="מצאו כל שיחה, ברגע."
            className="mx-auto w-full max-w-[16rem] sm:max-w-[20rem] h-auto"
          />
          <p className="mt-6 text-sm sm:text-base text-muted-foreground">חפשו לפי איש קשר, מספר טלפון או תאריך.</p>

          <div className="relative mt-9 mx-auto max-w-xl">
            <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder=""
              dir="auto"
              className="pr-6 pl-14 h-16 text-base rounded-[2rem] border-0 bg-card shadow-[0_2px_16px_-6px_rgba(0,0,0,0.12)] focus-visible:ring-0"
            />
            {filters.search.length === 0 && examples.length > 0 && (
              <TypewriterPlaceholder examples={examples} />
            )}
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>אפשר לכתוב גם חלק ממספר טלפון, שם או תאריך.</span>
            <Lightbulb className="w-4 h-4 text-primary shrink-0" />
          </p>

          {!hasSearch && suggestions.length > 0 && (
            <div className="mt-12">
              <p className="text-sm text-foreground/80">נסו למשל</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {suggestions.map((s) => {
                  const Icon = s.hint === "מספר טלפון" ? Phone : s.hint === "תאריך" ? CalendarDays : User;
                  return (
                    <button
                      key={s.key || s.label}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, search: s.label }))}
                      className="inline-flex flex-row-reverse items-center gap-2.5 rounded-full bg-card px-5 py-3.5 text-sm text-foreground shadow-[0_2px_10px_-6px_rgba(0,0,0,0.15)] hover:bg-accent transition-colors"
                    >
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Call history, revealed on scroll */}
        {!hasSearch && (
          <HistoryReveal
            ref={historyRef}
            sendingId={sendingId}
            onSend={(rec) => setPending(rec)}
            onHide={setHidePending}
            isPrivate={isPrivate}
          />
        )}

        {/* Results */}
        {hasSearch ? (
          <div className="mt-8 animate-in fade-in duration-200">
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
                  {loading && <RecordingRowsSkeleton />}
                  {!loading && recordings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-right text-muted-foreground text-sm">
                        <p>אין שיחות כאלה</p>
                        <p className="mt-1 text-xs text-muted-foreground/80">נסו שם אחר, מספר טלפון או טווח תאריכים אחר</p>
                      </td>
                    </tr>
                  )}
                  {!loading && recordings.map((r) => (
                    <RecordingRow key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} onHide={setHidePending} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden space-y-3.5">
              {loading && <RecordingCardsSkeleton />}
              {!loading && recordings.length === 0 && (
                <div className="py-16 text-right text-muted-foreground text-sm">
                  <p>אין שיחות כאלה</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">נסו שם אחר, מספר טלפון או טווח תאריכים אחר</p>
                </div>
              )}
              {!loading && recordings.map((r) => (
                <RecordingCard key={r.id} recording={r} sendingId={sendingId} onSend={(rec) => setPending(rec)} onHide={setHidePending} />
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
        error={sendError}
        onConfirm={confirmSend}
        onClose={() => setPending(null)}
      />

      <HideContactDialog
        recording={hidePending}
        working={hiding}
        onConfirm={confirmHide}
        onClose={() => setHidePending(null)}
      />
    </div>
  );
}