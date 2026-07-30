import React from "react";
import { TEMPLATE_TOKENS } from "@/lib/messageTemplate";

export default function TemplateTokenHints({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATE_TOKENS.map((t) => (
        <button
          key={t.token}
          type="button"
          onClick={() => onInsert(t.token)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <span className="font-mono" dir="ltr">{t.token}</span> · {t.label}
        </button>
      ))}
    </div>
  );
}