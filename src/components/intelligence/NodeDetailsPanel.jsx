import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { typeLabel } from "@/lib/intelligence/graphTypes";
import { Check, Pencil, Trash2, Merge, ExternalLink, Quote, AlertTriangle } from "lucide-react";

export default function NodeDetailsPanel({ node, graph, onClose, onRename, onDelete, onApprove, onMerge }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!node) return null;
  const { nodes, edges } = graph;
  const related = edges.filter((e) => e.source === node.id || e.target === node.id);
  const other = (e) => nodes.find((n) => n.id === (e.source === node.id ? e.target : e.source));
  const callNodes = nodes.filter((n) => n.type === "call" && (node.calls || []).includes(n.id));
  const people = related.map(other).filter((n) => n && (n.type === "client" || n.type === "team"));
  const openItems = related.map(other).filter((n) => n && (n.type === "promise" || n.type === "task") && n.status === "open");
  const mergeCandidates = nodes.filter((n) => n.id !== node.id && n.type === node.type).slice(0, 5);

  const section = "mt-5";
  const h = "text-xs font-medium text-muted-foreground";

  return (
    <Sheet open={!!node} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" dir="rtl" className="w-[22rem] sm:w-[26rem] overflow-y-auto text-right">
        <SheetHeader className="text-right">
          <SheetTitle className="text-base">{node.label}</SheetTitle>
        </SheetHeader>
        <p className="mt-1 text-xs text-muted-foreground">{typeLabel(node.type)}</p>
        {node.verify && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" /> דורשת אימות
          </p>
        )}
        {node.summary && <p className="mt-3 text-sm leading-relaxed">{node.summary}</p>}

        <div className="mt-4 flex gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-muted px-2.5 py-1">הופיעה ב-{node.calls?.length || 0} שיחות</span>
          <span className="rounded-full bg-muted px-2.5 py-1">{related.length} קשרים</span>
        </div>

        {node.aliases?.length > 0 && (
          <div className={section}>
            <p className={h}>נוסחים שאוחדו</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.aliases.map((a) => (
                <span key={a} className="rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground">{a}</span>
              ))}
            </div>
          </div>
        )}

        {callNodes.length > 0 && (
          <div className={section}>
            <p className={h}>השיחות שבהן הופיעה</p>
            <div className="mt-2 space-y-2">
              {callNodes.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-medium">{c.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{c.summary}</p>
                  <Link to={`/history?q=${encodeURIComponent(c.label.replace("שיחה — ", ""))}`} className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary">
                    <ExternalLink className="w-3 h-3" /> פתיחת השיחה והתמלול
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {people.length > 0 && (
          <div className={section}>
            <p className={h}>לקוחות ואנשי צוות קשורים</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...new Map(people.map((p) => [p.id, p])).values()].map((p) => (
                <span key={p.id} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">{p.label}</span>
              ))}
            </div>
          </div>
        )}

        <div className={section}>
          <p className={h}>ציטוטים וקשרים מהתמלול</p>
          <div className="mt-2 space-y-2">
            {related.slice(0, 6).map((e) => (
              <div key={e.id} className="rounded-xl bg-muted/40 p-3">
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <Quote className="w-3 h-3 mt-0.5 shrink-0" /> {e.reason}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">{e.label} • {other(e)?.label}</p>
              </div>
            ))}
          </div>
        </div>

        {openItems.length > 0 && (
          <div className={section}>
            <p className={h}>הבטחות ומשימות פתוחות</p>
            <ul className="mt-2 space-y-1.5 text-[11px]">
              {openItems.map((i) => <li key={i.id} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-amber-800">{i.label}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-2 border-t border-border pt-4">
          {editing ? (
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={node.label} className="h-9 text-xs" />
              <Button size="sm" onClick={() => { onRename(node.id, name.trim() || node.label); setEditing(false); setName(""); }}>שמירה</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" /> עריכה</Button>
              <Button size="sm" variant="outline" onClick={() => onApprove(node.id)}><Check className="w-3.5 h-3.5" /> אישור</Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(node.id)}><Trash2 className="w-3.5 h-3.5" /> מחיקה</Button>
            </div>
          )}
          {mergeCandidates.length > 0 && (
            <div>
              <p className={h}>איחוד עם ישות דומה</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {mergeCandidates.map((c) => (
                  <button key={c.id} type="button" onClick={() => onMerge(node.id, c.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-accent">
                    <Merge className="w-3 h-3" /> {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}