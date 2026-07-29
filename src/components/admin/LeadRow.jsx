import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Phone } from "lucide-react";

export default function LeadRow({ lead, onChanged }) {
  const [working, setWorking] = useState(false);

  const toggleHandled = async () => {
    setWorking(true);
    try {
      await base44.entities.AccountRequest.update(lead.id, { handled: !lead.handled });
      await onChanged();
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${lead.handled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{lead.businessName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{lead.contactName}</p>
          <a href={`tel:${lead.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-primary" dir="ltr">
            <Phone className="w-3 h-3" /> {lead.phone}
          </a>
          {lead.notes && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{lead.notes}</p>}
        </div>
        <Button size="sm" variant={lead.handled ? "secondary" : "outline"} disabled={working} onClick={toggleHandled} className="gap-1.5 shrink-0 rounded-lg shadow-none text-xs">
          {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {lead.handled ? "טופל" : "סמן כטופל"}
        </Button>
      </div>
    </div>
  );
}