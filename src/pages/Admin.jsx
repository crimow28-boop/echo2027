import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Plus, ShieldAlert } from "lucide-react";
import ClientConfigForm from "@/components/admin/ClientConfigForm";
import ClientConfigRow from "@/components/admin/ClientConfigRow";
import useIsSystemAdmin from "@/hooks/useIsSystemAdmin";
import LeadsSection from "@/components/admin/LeadsSection";

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { isAdmin, checked } = useIsSystemAdmin();
  const [configs, setConfigs] = useState([]);
  const [editing, setEditing] = useState(null); // config object | "new" | null

  const load = useCallback(async () => {
    const rows = await base44.entities.UserSettings.list("-updated_date", 200);
    setConfigs(rows || []);
  }, []);

  useEffect(() => {
    if (!checked) return;
    (async () => {
      try {
        if (isAdmin) await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [checked, isAdmin, load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 font-body">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">הדף הזה זמין למנהלי המערכת בלבד.</p>
        <Button variant="outline" onClick={() => navigate("/")} className="gap-2 rounded-lg shadow-none">
          <ArrowRight className="w-4 h-4" /> חזרה
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div className="text-right">
            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight">ניהול לקוחות</h1>
            <p className="mt-2 text-sm text-muted-foreground">הגדרת חיבורי EXM ו-WhatsApp לכל לקוח</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {editing ? (
          <ClientConfigForm
            initial={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onDone={async () => {
              setEditing(null);
              await load();
            }}
          />
        ) : (
          <Button onClick={() => setEditing("new")} className="gap-2 h-10 rounded-lg text-sm">
            <Plus className="w-4 h-4" /> לקוח חדש
          </Button>
        )}

        <div className="mt-8 space-y-3">
          {configs.length === 0 && !editing && (
            <p className="py-12 text-sm text-muted-foreground text-right">אין לקוחות עדיין</p>
          )}
          {configs.map((c) => (
            <ClientConfigRow key={c.id} config={c} onEdit={setEditing} onChanged={load} />
          ))}
        </div>

        <LeadsSection
          onCreateClient={(lead) => {
            setEditing({ clientName: lead.businessName || "", clientPhone: lead.phone || "" });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}