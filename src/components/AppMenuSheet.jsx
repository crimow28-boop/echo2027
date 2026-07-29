import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Loader2, Download, History, Users, LogOut, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useIsSystemAdmin from "@/hooks/useIsSystemAdmin";

export default function AppMenuSheet({ onExport, exporting }) {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useIsSystemAdmin();
  const [client, setClient] = useState(null);

  useEffect(() => {
    base44.entities.UserSettings.filter({}, "-updated_date", 1)
      .then((rows) => setClient(rows?.[0] || null))
      .catch(() => {});
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
        {client?.clientName && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
              <Building2 className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{client.clientName}</p>
              <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                #{client.accountNumber || "—"}
              </p>
            </div>
          </div>
        )}
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
          <button
            type="button"
            className={`${itemClass} text-destructive hover:bg-destructive/10`}
            onClick={() => base44.auth.logout("/demo")}
          >
            <LogOut className="w-4 h-4" />
            <span>התנתקות</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}