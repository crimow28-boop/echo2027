import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RecordingFilters({ filters, onChange, resultCount, loading }) {
  return (
    <div className="border-2 border-foreground bg-card p-4 mb-6">
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="חיפוש לפי מספר טלפון..."
          className="pr-9 bg-transparent rounded-none font-mono border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary"
        />
      </div>
      <div className="flex items-center gap-2 pt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className={`inline-block w-2.5 h-2.5 ${loading ? "bg-muted-foreground animate-pulse" : "bg-primary"}`}></span>
        {loading ? "טוען..." : `נמצאו ${resultCount} הקלטות`}
      </div>
    </div>
  );
}