import React from "react";
import { TEMPLATE_TOKENS } from "@/lib/messageTemplate";

export default function TemplateTokenHints({ tokens = TEMPLATE_TOKENS, onInsert }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((t) => (
        <button
          key={t.token}
          type="button"
          onClick={() => onInsert(t.token)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          + {t.label}
        </button>
      ))}
    </div>
  );
}