import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function LogoutConfirmDialog({ open, onConfirm, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent dir="rtl" className="sm:max-w-sm text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base">להתנתק מהחשבון?</DialogTitle>
          <DialogDescription className="text-sm">
            תצטרכו להתחבר מחדש עם מספר החשבון והטלפון בכניסה הבאה.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
          <Button variant="destructive" className="rounded-lg" onClick={onConfirm}>
            התנתקות
          </Button>
          <Button variant="outline" className="rounded-lg shadow-none" onClick={onClose}>
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}