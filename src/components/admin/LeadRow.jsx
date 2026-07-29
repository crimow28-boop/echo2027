import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Phone, Plus, Trash2 } from "lucide-react";

export default function LeadRow({ lead, onChanged, onCreateClient }) {
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

  const remove = async () => {
    setWorking(true);
    try {
      await base44.entities.AccountRequest.delete(lead.id);
      await onChanged();
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${lead.handled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{lead.businessName || lead.contactName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lead.contactName}
            {lead.businessId ? ` · ח.פ ${lead.businessId}` : ""}
          </p>
          <a href={`tel:${lead.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-primary" dir="ltr">
            <Phone className="w-3 h-3" /> {lead.phone}
          </a>
          {lead.notes && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{lead.notes}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant={lead.handled ? "secondary" : "outline"} disabled={working} onClick={toggleHandled} className="gap-1.5 rounded-lg shadow-none text-xs">
            {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {lead.handled ? "טופל" : "סמן כטופל"}
          </Button>
          <Button
            size="sm"
            title="פתיחת כרטיס לקוח חדש"
            onClick={() => onCreateClient(lead)}
            className="gap-1.5 rounded-lg text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> לקוח חדש
          </Button>
          {lead.handled && (
            <Button
              size="sm"
              variant="outline"
              title="מחיקת הליד"
              disabled={working}
              onClick={remove}
              className="h-8 w-8 p-0 rounded-lg shadow-none text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}