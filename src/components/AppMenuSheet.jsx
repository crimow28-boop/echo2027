import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Loader2, Download, History, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AppMenuSheet({ onExport, exporting }) {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
  }, []);
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
      <SheetContent side="right" dir="rtl" className="w-72 text-right">
        <SheetHeader className="text-right">
          <SheetTitle className="text-base font-semibold">תפריט</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          <Link to="/history" onClick={() => setOpen(false)} className={itemClass}>
            <History className="w-4 h-4" />
            <span>כל ההקלטות</span>
          </Link>
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
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className={itemClass}>
              <Users className="w-4 h-4" />
              <span>ניהול לקוחות</span>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}