import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MessageKindTabs from "@/components/template/MessageKindTabs";
import MessageTemplateEditor from "@/components/template/MessageTemplateEditor";
import { MESSAGE_KINDS, loadTemplates } from "@/lib/messageTemplate";

export default function MessageTemplatePage() {
  const [selected, setSelected] = useState("recording");
  const [records, setRecords] = useState({});
  const [bodies, setBodies] = useState({});
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKind, setSavedKind] = useState(null);

  useEffect(() => {
    Promise.all([loadTemplates(base44), base44.auth.me().catch(() => null)]).then(([map, user]) => {
      setRecords(map);
      const next = {};
      MESSAGE_KINDS.forEach((k) => {
        next[k.id] = map[k.id]?.body || k.defaultBody;
      });
      setBodies(next);
      setBusinessName(user?.full_name || "");
      setLoading(false);
    });
  }, []);

  const kind = MESSAGE_KINDS.find((k) => k.id === selected);

  const save = async () => {
    setSaving(true);
    try {
      const body = bodies[selected];
      const existing = records[selected];
      if (existing) await base44.entities.MessageTemplate.update(existing.id, { body });
      else {
        const created = await base44.entities.MessageTemplate.create({ kind: selected, body });
        setRecords((r) => ({ ...r, [selected]: created }));
      }
      setSavedKind(selected);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background bg-grid">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              ההודעות שנשלחות ללקוח
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              בוחרים סוג הודעה, עורכים את הטקסט ושומרים. אפשר לערוך גם לפני כל שליחה.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            חזרה <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <MessageKindTabs value={selected} onChange={(id) => { setSelected(id); setSavedKind(null); }} />
            </div>
            <div className="mt-6">
              <MessageTemplateEditor
                kind={kind}
                body={bodies[selected] || ""}
                onChange={(v) => { setBodies((b) => ({ ...b, [selected]: v })); setSavedKind(null); }}
                onSave={save}
                saving={saving}
                saved={savedKind === selected}
                businessName={businessName}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}