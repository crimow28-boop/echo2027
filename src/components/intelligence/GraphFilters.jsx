import React from "react";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw } from "lucide-react";
import { NODE_TYPES } from "@/lib/intelligence/graphTypes";

const selectClass =
  "h-9 rounded-full border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function GraphFilters({ filters, setFilters, clients, team, onReset }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const toggleType = (t) =>
    set({ types: filters.types.includes(t) ? filters.types.filter((x) => x !== t) : [...filters.types, t] });

  return (
    <div className="rounded-3xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="חיפוש חופשי בגרף..."
            className="h-9 rounded-full pr-9 text-xs"
          />
        </div>
        <input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={selectClass} />
        <input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={selectClass} />
        <select value={filters.client} onChange={(e) => set({ client: e.target.value })} className={selectClass}>
          <option value="">כל הלקוחות</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filters.team} onChange={(e) => set({ team: e.target.value })} className={selectClass}>
          <option value="">כל הצוות</option>
          {team.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filters.direction} onChange={(e) => set({ direction: e.target.value })} className={selectClass}>
          <option value="">נכנסות ויוצאות</option>
          <option value="incoming">נכנסות</option>
          <option value="outgoing">יוצאות</option>
        </select>
        <select value={filters.kind} onChange={(e) => set({ kind: e.target.value })} className={selectClass}>
          <option value="">מכירה ושירות</option>
          <option value="sales">מכירה</option>
          <option value="service">שירות</option>
        </select>
        <select value={filters.outcome} onChange={(e) => set({ outcome: e.target.value })} className={selectClass}>
          <option value="">כל התוצאות</option>
          <option value="closed">נסגר</option>
          <option value="lost">לא נסגר</option>
          <option value="waiting">ממתין</option>
          <option value="followup">נדרש מעקב</option>
        </select>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-accent">
          <RotateCcw className="w-3.5 h-3.5" /> איפוס
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {[
          { key: "openPromises", label: "הבטחות פתוחות" },
          { key: "openTasks", label: "משימות שלא בוצעו" },
          { key: "followup", label: "דורש מעקב" },
          { key: "merged", label: "איחוד ישויות דומות" }
        ].map((t) => (
          <label key={t.key} className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={!!filters[t.key]} onChange={(e) => set({ [t.key]: e.target.checked })} className="accent-teal-600" />
            {t.label}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(NODE_TYPES).map(([key, meta]) => {
          const on = filters.types.length === 0 || filters.types.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleType(key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                on ? "border-border bg-muted/50 text-foreground" : "border-dashed border-border text-muted-foreground/60"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}