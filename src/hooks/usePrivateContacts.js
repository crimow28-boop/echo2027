import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { normalizePrivatePhone } from "@/lib/privatePhone";

// Loads the user's private contacts and exposes helpers to hide/unhide numbers.
export default function usePrivateContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const rows = (await base44.entities.PrivateContact.list("-created_date", 500)) || [];
    setContacts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload().catch(() => setLoading(false));
  }, [reload]);

  const isPrivate = useCallback(
    (number) => {
      const n = normalizePrivatePhone(number);
      return !!n && contacts.some((c) => normalizePrivatePhone(c.phone) === n);
    },
    [contacts]
  );

  // Hiding/unhiding runs on the server so the calls themselves are excluded from
  // every response — not merely filtered out in the browser.
  const hide = useCallback(
    async (recording) => {
      const phone = normalizePrivatePhone(recording?.callerNumber);
      if (!phone) return;
      const res = await base44.functions.invoke("setContactPrivacy", {
        action: "hide",
        phone,
        name: recording.callerFriendly || ""
      });
      if (!res.data?.success) throw new Error(res.data?.error || "הסתרת איש הקשר נכשלה");
      setContacts((prev) => [res.data.contact, ...prev]);
    },
    []
  );

  const unhide = useCallback(async (id) => {
    const res = await base44.functions.invoke("setContactPrivacy", { action: "unhide", contactId: id });
    if (!res.data?.success) throw new Error(res.data?.error || "החזרת השיחות נכשלה");
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { contacts, loading, isPrivate, hide, unhide, reload };
}