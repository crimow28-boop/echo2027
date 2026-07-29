import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Loader2, RefreshCw, Download, History, Settings as SettingsIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AppMenuSheet({ onSync, onExport, syncing, exporting, hasSettings }) {
  const [open, setOpen] = useState(false);
  const itemClass =
    "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" dir="rtl" className="w-72 text-right">
        <SheetHeader className="text-right">
          <SheetTitle className="text-base font-semibold">תפריט</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          <Link to="/history" onClick={() => setOpen(false)} className={itemClass}>
            <History className="w-4 h-4" />
            <span>היסטוריית שיחות</span>
          </Link>
          <button
            type="button"
            className={itemClass}
            disabled={syncing || !hasSettings}
            onClick={() => {
              setOpen(false);
              onSync();
            }}
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>סנכרון הקלטות</span>
          </button>
          <button
            type="button"
            className={itemClass}
            disabled={exporting}
            onClick={() => {
              setOpen(false);
              onExport();
            }}
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>ייצוא ל-CSV</span>
          </button>
          <Link to="/settings" onClick={() => setOpen(false)} className={itemClass}>
            <SettingsIcon className="w-4 h-4" />
            <span>הגדרות</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}