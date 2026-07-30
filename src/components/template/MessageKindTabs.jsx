import React from "react";
import { Check } from "lucide-react";
import { MESSAGE_KINDS } from "@/lib/messageTemplate";

export default function MessageKindTabs({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MESSAGE_KINDS.map((k) => {
        const active = k.id === value;
        return (
          <button
            key={k.id}
            type="button"
            onClick={() => onChange(k.id)}
            className={`rounded-2xl border p-4 text-right transition-colors ${
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-accent/60"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{k.label}</span>
              {active && <Check className="w-4 h-4 text-primary" />}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{k.description}</p>
          </button>
        );
      })}
    </div>
  );
}