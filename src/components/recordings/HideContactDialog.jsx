import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeOff, Loader2 } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/recordingUtils";

export default function HideContactDialog({ recording, working, onConfirm, onClose }) {
  return (
    <Dialog open={!!recording} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base font-semibold">להוסיף לאנשי הקשר הפרטיים?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            כל השיחות עם איש קשר זה, בעבר ובעתיד, יוסתרו מ-Echo. ניתן לשנות זאת בכל עת דרך ההגדרות.
          </DialogDescription>
        </DialogHeader>
        {recording && (
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">{recording.callerFriendly || "ללא שם"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground font-mono" dir="ltr">
              {formatPhoneDisplay(recording.callerNumber)}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-start">
          <Button disabled={working} onClick={onConfirm} className="gap-2 h-11 rounded-lg">
            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
            הסתרת כל השיחות
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-lg border border-border bg-card hover:bg-accent shadow-none">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}