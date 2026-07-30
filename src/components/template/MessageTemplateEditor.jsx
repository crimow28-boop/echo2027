import React, { useRef } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TemplateTokenHints from "@/components/template/TemplateTokenHints";
import WhatsAppBubble from "@/components/recordings/WhatsAppBubble";
import { fillTemplate } from "@/lib/messageTemplate";

export default function MessageTemplateEditor({ kind, body, onChange, onSave, saving, saved, businessName }) {
  const areaRef = useRef(null);

  const insert = (token) => {
    const el = areaRef.current;
    if (!el) return onChange(body + token);
    const start = el.selectionStart ?? body.length;
    onChange(body.slice(0, start) + token + body.slice(el.selectionEnd ?? start));
  };

  return (
    <div className="space-y-4">
      <TemplateTokenHints tokens={kind.tokens} onInsert={insert} />
      <Textarea
        ref={areaRef}
        dir="rtl"
        rows={12}
        value={body}
        onChange={(e) => onChange(e.target.value)}
        style={{ unicodeBidi: "plaintext" }}
        className="text-right text-[13px] leading-relaxed rounded-xl"
      />

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמירה
        </Button>
        <Button variant="outline" className="gap-2 shadow-none" onClick={() => onChange(kind.defaultBody)}>
          <RotateCcw className="w-4 h-4" /> ברירת מחדל
        </Button>
        {saved && <span className="text-xs text-primary">נשמר</span>}
      </div>

      <div className="pt-4">
        <p className="mb-2 text-xs text-muted-foreground">תצוגה מקדימה</p>
        <WhatsAppBubble message={fillTemplate(kind.sample, businessName, body)} />
      </div>
    </div>
  );
}