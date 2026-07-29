import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LeadRow from "@/components/admin/LeadRow";

export default function LeadsSection() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rows = await base44.entities.AccountRequest.list("-created_date", 100);
    setLeads(rows || []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  return (
    <div className="mt-12">
      <h2 className="font-heading text-2xl tracking-tight">לידים נכנסים</h2>
      <p className="mt-1 text-sm text-muted-foreground">בקשות פתיחת חשבון מהאתר</p>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">אין לידים חדשים</p>
      ) : (
        <div className="mt-5 space-y-3">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}