import React from "react";
import { PhoneMissed } from "lucide-react";

export default function MissedCallNotice() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
      <PhoneMissed className="w-4 h-4 text-destructive shrink-0" />
      השיחה לא נענתה
    </div>
  );
}