import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, RotateCcw, Save, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TemplateTokenHints from "@/components/template/TemplateTokenHints";
import WhatsAppBubble from "@/components/recordings/WhatsAppBubble";
import { DEFAULT_TEMPLATE, buildRecordingMessage } from "@/lib/messageTemplate";

const SAMPLE = { callDate: new Date().toISOString(), duration: 95 };

export default function MessageTemplatePage() {
  const [record, setRecord] = useState(null);
  const [body, setBody] = useState(DEFAULT_TEMPLATE);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const areaRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.MessageTemplate.list("-updated_date", 1).catch(() => []),
      base44.auth.me().catch(() => null)
    ]).then(([rows, user]) => {
      const row = rows?.[0] || null;
      setRecord(row);
      if (row?.body) setBody(row.body);
      setBusinessName(user?.full_name || "");
      setLoading(false);
    });
  }, []);

  const insert = (token) => {
    const el = areaRef.current;
    if (!el) return setBody((b) => b + token);
    const start = el.selectionStart ?? body.length;
    setBody(body.slice(0, start) + token + body.slice(el.selectionEnd ?? start));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (record) await base44.entities.MessageTemplate.update(record.id, { body });
      else setRecord(await base44.entities.MessageTemplate.create({ body }));
      setSaved(true);
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
              ההודעה שנשלחת ללקוח
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              זו ברירת המחדל שתופיע בכל שליחה. ניתן לערוך גם לפני כל שליחה בודדת.
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
            <div className="mt-6 space-y-3">
              <TemplateTokenHints onInsert={insert} />
              <Textarea
                ref={areaRef}
                dir="rtl"
                rows={14}
                value={body}
                onChange={(e) => { setBody(e.target.value); setSaved(false); }}
                style={{ unicodeBidi: "plaintext" }}
                className="text-right text-[13px] leading-relaxed rounded-xl"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                שמירה
              </Button>
              <Button
                variant="outline"
                className="gap-2 shadow-none"
                onClick={() => { setBody(DEFAULT_TEMPLATE); setSaved(false); }}
              >
                <RotateCcw className="w-4 h-4" /> שחזור ברירת מחדל
              </Button>
              {saved && <span className="text-xs text-primary">נשמר</span>}
            </div>

            <div className="mt-8">
              <p className="mb-2 text-xs text-muted-foreground">תצוגה מקדימה</p>
              <WhatsAppBubble message={buildRecordingMessage(SAMPLE, businessName, body)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}