import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";

// Contacts are built from the account's call history: one entry per phone number,
// keeping the friendly name when the switchboard supplied one.
export default function DialerContacts({ onSelect }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    base44.entities.CallRecording.list("-callDate", 300)
      .then((rows) => {
        const map = new Map();
        (rows || []).forEach((r) => {
          const phone = (r.callerNumber || "").trim();
          if (!phone || map.has(phone)) return;
          map.set(phone, { phone, name: (r.callerFriendly || "").trim() });
        });
        setContacts([...map.values()]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (c) => c.phone.includes(term) || c.name.toLowerCase().includes(term)
    );
  }, [contacts, q]);

  if (loading) return null;
  if (!contacts.length) return null;

  return (
    <div className="mt-6 rounded-[2rem] bg-card p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)]">
      <h2 className="font-heading text-lg">אנשי קשר</h2>
      <div className="relative mt-3">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש שם או מספר"
          className="h-11 rounded-2xl border-border bg-muted/40 pr-9 text-sm focus-visible:ring-0 focus-visible:border-primary/50"
        />
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">לא נמצאו אנשי קשר</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.phone}
              type="button"
              onClick={() => onSelect(c.phone)}
              className="w-full flex items-center gap-3 py-3 text-right hover:bg-accent/60 rounded-xl px-2 transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm truncate">{c.name || c.phone}</span>
                {c.name && (
                  <span dir="ltr" className="block text-xs text-muted-foreground font-mono">
                    {c.phone}
                  </span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}