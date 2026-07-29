import React, { useEffect, useState } from "react";
import { Search, Send, Play } from "lucide-react";

const DEMO_ROWS = [
  { name: "משה כהן", number: "052-8841203", duration: "2:14", date: "28.07 · 14:32", sent: true },
  { name: "דנה לוי", number: "054-7712098", duration: "0:48", date: "28.07 · 11:05", sent: false },
  { name: "מוסך אלון", number: "03-6541122", duration: "5:37", date: "27.07 · 17:49", sent: true }
];

const TYPED = "משה כהן";

export default function DemoSearchPreview() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = i + 1 > TYPED.length ? 0 : i + 1;
      setTyped(TYPED.slice(0, i));
    }, 260);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.25)]">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <div className="h-12 rounded-full bg-muted/60 flex items-center pr-5 pl-11 text-sm text-foreground">
          {typed}
          <span className="ml-0.5 w-px h-4 bg-primary animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {DEMO_ROWS.map((r) => (
          <div key={r.number} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <Play className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                {r.number} · {r.duration}
              </p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-[11px] text-muted-foreground">{r.date}</p>
              <p className={`mt-1 inline-flex items-center gap-1 text-[11px] ${r.sent ? "text-primary" : "text-muted-foreground"}`}>
                <Send className="w-3 h-3" />
                {r.sent ? "נשלח" : "ממתין"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">תצוגת דמו — נתונים לדוגמה</p>
    </div>
  );
}