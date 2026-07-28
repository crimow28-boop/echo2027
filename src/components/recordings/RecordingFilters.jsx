import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RecordingFilters({ filters, onChange, resultCount, loading }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 mb-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="חיפוש לפי מספר טלפון..."
          className="pr-9 bg-background/60 border-border focus-visible:ring-2 focus-visible:ring-ring/60"
        />
      </div>
      <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${loading ? "bg-muted-foreground animate-pulse" : "bg-[#00ffcc] glow-teal-sm"}`}></span>
        {loading ? "טוען..." : `נמצאו ${resultCount} הקלטות`}
      </div>
    </div>
  );
}