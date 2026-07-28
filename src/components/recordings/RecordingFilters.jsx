import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function RecordingFilters({ filters, onChange, onReset, resultCount, loading }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 mb-6 space-y-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="חיפוש לפי שם או מספר..."
            className="pr-9 bg-background/60 border-border focus-visible:ring-2 focus-visible:ring-ring/60"
          />
        </div>
        <Select value={filters.callType} onValueChange={(v) => onChange("callType", v)}>
          <SelectTrigger className="w-full sm:w-40 bg-background/60 border-border focus:ring-2 focus:ring-ring/60"><SelectValue placeholder="סוג שיחה" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="incoming">נכנסת</SelectItem>
            <SelectItem value="outgoing">יוצאת</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sent} onValueChange={(v) => onChange("sent", v)}>
          <SelectTrigger className="w-full sm:w-40 bg-background/60 border-border focus:ring-2 focus:ring-ring/60"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="sent">נשלח</SelectItem>
            <SelectItem value="pending">ממתין</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">מתאריך</label>
          <Input type="date" value={filters.fromDate} onChange={(e) => onChange("fromDate", e.target.value)} className="bg-background/60 border-border focus-visible:ring-2 focus-visible:ring-ring/60" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">עד תאריך</label>
          <Input type="date" value={filters.toDate} onChange={(e) => onChange("toDate", e.target.value)} className="bg-background/60 border-border focus-visible:ring-2 focus-visible:ring-ring/60" />
        </div>
        <Button variant="outline" onClick={onReset} className="gap-1.5 border-border bg-background/40 hover:bg-accent hover:text-accent-foreground">
          <RotateCcw className="w-4 h-4" /> איפוס
        </Button>
      </div>
      <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${loading ? "bg-muted-foreground animate-pulse" : "bg-[#00ffcc] glow-teal-sm"}`}></span>
        {loading ? "טוען..." : `נמצאו ${resultCount} הקלטות`}
      </div>
    </div>
  );
}