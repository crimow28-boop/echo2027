import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// System admin = platform admin role AND not a client login account
// (client accounts are created behind the scenes and must never see client management).
export default function useIsSystemAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin" || !user?.email) {
          setIsAdmin(false);
          return;
        }
        const rows = await base44.entities.UserSettings.filter({ clientEmail: user.email }, "-updated_date", 1);
        setIsAdmin(!rows?.length);
      } catch (_e) {
        setIsAdmin(false);
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  return { isAdmin, checked };
}