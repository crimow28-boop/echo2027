import React from "react";
import { Sparkles } from "lucide-react";

export default function InsightCards({ insights, onOpen }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onOpen(c)}
          className="text-right rounded-2xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] transition-all"
        >
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {c.title}
          </div>
          <p className="mt-2 font-heading text-lg leading-tight">{c.value}</p>
          {c.note && <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{c.note}</p>}
        </button>
      ))}
    </div>
  );
}