import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link2 } from "lucide-react";

export default function EdgeExplainDialog({ edge, graph, onClose }) {
  if (!edge) return null;
  const name = (id) => graph.nodes.find((n) => n.id === id)?.label || id;
  return (
    <Dialog open={!!edge} onOpenChange={(v) => !v && onClose()}>
      <DialogContent dir="rtl" className="max-w-md text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base">למה הנקודות מחוברות?</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{name(edge.source)}</span>
          <Link2 className="w-4 h-4 text-primary" />
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{name(edge.target)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{edge.label}</p>
        <p className="text-sm leading-relaxed">{edge.reason}</p>
        {edge.calls?.length > 0 && (
          <p className="text-[11px] text-muted-foreground">מבוסס על {edge.calls.length} שיחות מתומללות.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}