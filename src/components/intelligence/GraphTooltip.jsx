import React from "react";
import { typeLabel } from "@/lib/intelligence/graphTypes";

// Short hover summary, positioned in % over the graph canvas.
export default function GraphTooltip({ node, x, y }) {
  return (
    <div
      dir="rtl"
      className="pointer-events-none absolute z-10 max-w-[15rem] -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-popover px-3 py-2 text-right shadow-lg"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <p className="text-xs font-medium">{node.label}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{typeLabel(node.type)}</p>
      {node.summary && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{node.summary}</p>}
    </div>
  );
}