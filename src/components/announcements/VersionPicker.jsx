import React from "react";
import { Check } from "lucide-react";

const OPTIONS = [
  { key: "sentence", title: "משפט ההודעה בלבד", hint: "יש לכם כבר הודעת פתיחה" },
  { key: "opener", title: "הודעת פתיחה שלמה", hint: "אין לכם הודעת פתיחה" },
];

export default function VersionPicker({ value, onChange }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`text-right rounded-2xl border p-4 transition-colors ${
              active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{o.title}</span>
              {active && <Check className="w-4 h-4 text-primary shrink-0" />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{o.hint}</p>
          </button>
        );
      })}
    </div>
  );
}