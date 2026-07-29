import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import usePrivateContacts from "@/hooks/usePrivateContacts";
import UnhideContactDialog from "@/components/private/UnhideContactDialog";
import { formatPhoneDisplay } from "@/lib/recordingUtils";

export default function PrivateContacts() {
  const { contacts, loading, unhide } = usePrivateContacts();
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(null);
  const [working, setWorking] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    const digits = term.replace(/\D/g, "");
    return contacts.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(term) ||
        (digits && (c.phone || "").includes(digits))
    );
  }, [contacts, search]);

  const confirmUnhide = async () => {
    setWorking(true);
    try {
      await unhide(pending.id);
      setPending(null);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
          חזרה לחיפוש
        </Link>

        <h1 className="font-heading mt-6 text-2xl sm:text-3xl font-bold tracking-tight">אנשי קשר פרטיים</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          שיחות עם המספרים האלה מוסתרות מ-Echo. אפשר להחזיר אותן לתצוגה בכל עת.
        </p>

        <div className="relative mt-7">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או מספר טלפון"
            className="pr-4 pl-11 h-12 rounded-xl border border-border bg-card focus-visible:ring-0 focus-visible:border-primary/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-sm text-muted-foreground">
            <p>{contacts.length === 0 ? "אין אנשי קשר פרטיים" : "לא נמצאו אנשי קשר מתאימים"}</p>
            {contacts.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground/80">
                אפשר לסמן איש קשר כפרטי דרך כפתור ההסתרה בכל שיחה.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-2.5">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground shrink-0">
                    <EyeOff className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name || "ללא שם"}</p>
                    <p className="text-xs text-muted-foreground font-mono" dir="ltr">{formatPhoneDisplay(c.phone)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPending(c)}
                  className="h-9 rounded-lg border border-border bg-card hover:bg-accent shadow-none text-xs shrink-0"
                >
                  החזרת השיחות
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <UnhideContactDialog
        contact={pending}
        working={working}
        onConfirm={confirmUnhide}
        onClose={() => setPending(null)}
      />
    </div>
  );
}