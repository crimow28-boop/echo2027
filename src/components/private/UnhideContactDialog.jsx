import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/recordingUtils";

export default function UnhideContactDialog({ contact, working, onConfirm, onClose }) {
  return (
    <Dialog open={!!contact} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base font-semibold">להסיר מאנשי הקשר הפרטיים?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            השיחות עם איש קשר זה יחזרו להופיע במערכת.
          </DialogDescription>
        </DialogHeader>
        {contact && (
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">{contact.name || "ללא שם"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground font-mono" dir="ltr">
              {formatPhoneDisplay(contact.phone)}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-start">
          <Button disabled={working} onClick={onConfirm} className="gap-2 h-11 rounded-lg">
            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            החזרת השיחות
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-lg border border-border bg-card hover:bg-accent shadow-none">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}