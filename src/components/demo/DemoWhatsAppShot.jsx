import React from "react";
import { Image } from "@/components/ui/image";

const SHOT = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/00fba2dac_WhatsAppImage2026-07-31at1257071.jpeg";

export default function DemoWhatsAppShot() {
  return (
    <div className="text-center">
      <p className="font-heading text-xl">ככה זה נראה אצל הלקוח</p>
      <p className="mt-2 text-sm text-muted-foreground">הלקוח מבקש את ההקלטה — ומקבל קישור בוואטסאפ.</p>
      <div className="mt-6 mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
        <Image
          src={SHOT}
          alt="שיחת וואטסאפ עם לקוח שמקבל קישור להקלטה"
          fittingType="fit"
          originWidth={740}
          originHeight={844}
          className="w-full"
        />
      </div>
    </div>
  );
}