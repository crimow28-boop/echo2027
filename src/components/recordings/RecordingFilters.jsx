import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function RecordingFilters({ filters, onChange, onReset, resultCount, loading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="חיפוש לפי שם או מספר..."
            className="pr-9"
          />
        </div>
        <Select value={filters.callType} onValueChange={(v) => onChange("callType", v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="סוג שיחה" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="incoming">נכנסת</SelectItem>
            <SelectItem value="outgoing">יוצאת</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sent} onValueChange={(v) => onChange("sent", v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="sent">נשלח</SelectItem>
            <SelectItem value="pending">ממתין</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">מתאריך</label>
          <Input type="date" value={filters.fromDate} onChange={(e) => onChange("fromDate", e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">עד תאריך</label>
          <Input type="date" value={filters.toDate} onChange={(e) => onChange("toDate", e.target.value)} />
        </div>
        <Button variant="outline" onClick={onReset} className="gap-1.5">
          <RotateCcw className="w-4 h-4" /> איפוס
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        {loading ? "טוען..." : `נמצאו ${resultCount} הקלטות`}
      </div>
    </div>
  );
}