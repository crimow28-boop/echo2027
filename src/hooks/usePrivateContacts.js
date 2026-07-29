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

  const hide = useCallback(
    async (recording) => {
      const phone = normalizePrivatePhone(recording?.callerNumber);
      if (!phone) return;
      const created = await base44.entities.PrivateContact.create({
        phone,
        name: recording.callerFriendly || ""
      });
      setContacts((prev) => [created, ...prev]);
    },
    []
  );

  const unhide = useCallback(async (id) => {
    await base44.entities.PrivateContact.delete(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { contacts, loading, isPrivate, hide, unhide, reload };
}