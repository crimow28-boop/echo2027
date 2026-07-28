import React from "react";
import { parseSearchRequest } from "@/lib/searchParser";

const fmt = (d) =>
  new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

// Shows how the free-text request was understood (dates / name / number),
// so an empty result is explainable.
export default function SearchSummary({ search }) {
  const { text, from, to } = parseSearchRequest(search);
  const chips = [];

  if (from && to) {
    const same = fmt(from) === fmt(to);
    chips.push(same ? `תאריך: ${fmt(from)}` : `תאריכים: ${fmt(from)} – ${fmt(to)}`);
  }
  if (text) chips.push(`חיפוש: ${text}`);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {chips.map((c) => (
        <span key={c} className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          {c}
        </span>
      ))}
    </div>
  );
}