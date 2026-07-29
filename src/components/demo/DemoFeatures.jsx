import React from "react";
import { Search, MessageCircle, RefreshCw, Download } from "lucide-react";

const FEATURES = [
  { icon: Search, title: "חיפוש חכם", text: "שם, מספר טלפון או תאריך — ומוצאים את השיחה בשנייה." },
  { icon: MessageCircle, title: "שליחה בוואטסאפ", text: "שולחים את ההקלטה ללקוח בלחיצה, עם הודעה שניתן לערוך." },
  { icon: RefreshCw, title: "סנכרון אוטומטי", text: "כל שיחה חדשה נכנסת למערכת מעצמה, בלי הגדרות." },
  { icon: Download, title: "ייצוא והורדה", text: "מורידים קובץ הקלטה או מייצאים את כל הרשימה ל-CSV." }
];

export default function DemoFeatures() {
  return (
    <div className="grid sm:grid-cols-2 gap-3.5">
      {FEATURES.map((f) => (
        <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <f.icon className="w-4 h-4" />
          </span>
          <p className="mt-3 font-heading text-base">{f.title}</p>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
        </div>
      ))}
    </div>
  );
}