import React, { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEMO_SUGGESTIONS, filterDemoRecordings } from "@/lib/demoData";
import DemoRecordingCard from "@/components/demo/DemoRecordingCard";
import DemoSendDialog from "@/components/demo/DemoSendDialog";

export default function DemoPlayground() {
  const [search, setSearch] = useState("");
  const [sentIds, setSentIds] = useState([]);
  const [pending, setPending] = useState(null);

  const results = useMemo(() => filterDemoRecordings(search), [search]);

  return (
    <div className="rounded-[1.75rem] bg-card p-4 sm:p-6 ring-1 ring-black/5 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-2 text-xs text-primary">
        <Sparkles className="w-3.5 h-3.5" />
        דמו אינטראקטיבי — חפשו, האזינו ושלחו
      </div>

      <div className="relative mt-4">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="שם, מספר טלפון או תאריך (למשל 28.07)"
          dir="auto"
          className="h-12 pr-5 pl-11 text-sm rounded-full border-0 bg-card shadow-[0_2px_12px_-8px_rgba(0,0,0,0.2)] focus-visible:ring-0"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {DEMO_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSearch(s)}
            className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          >
            {s}
          </button>
        ))}
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ניקוי
          </button>
        )}
      </div>

      {search.trim() && (
        <>
          <p className="mt-4 text-xs text-muted-foreground">נמצאו {results.length} שיחות</p>

          <div className="mt-3 space-y-3">
            {results.length === 0 ? (
              <p className="py-10 text-sm text-muted-foreground text-center">אין שיחות כאלה — נסו "משה" או "052"</p>
            ) : (
              results.map((r) => (
                <DemoRecordingCard
                  key={r.id}
                  recording={r}
                  sent={sentIds.includes(r.id)}
                  onSend={setPending}
                />
              ))
            )}
          </div>
        </>
      )}

      <DemoSendDialog
        recording={pending}
        onConfirm={(id) => {
          setSentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
          setPending(null);
        }}
        onClose={() => setPending(null)}
      />
    </div>
  );
}