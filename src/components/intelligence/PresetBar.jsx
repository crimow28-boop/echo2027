import React from "react";
import { PRESETS } from "@/lib/intelligence/graphFilters";

export default function PresetBar({ active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p)}
          className={`rounded-full px-3.5 py-1.5 text-xs border transition-colors ${
            active === p.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}