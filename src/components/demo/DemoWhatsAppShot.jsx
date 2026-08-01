import React from "react";
import { Image } from "@/components/ui/image";

const SHOT = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/4d729a7aa_Screenshot2026-08-01at115257.png";

export default function DemoWhatsAppShot() {
  return (
    <div className="text-center">
      <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] tracking-wide text-muted-foreground">
        וואטסאפ
      </span>
      <p className="mt-4 font-heading text-2xl tracking-tight">ככה זה נראה אצל הלקוח</p>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground max-w-sm mx-auto">
        הלקוח מבקש את ההקלטה — ומקבל קישור בוואטסאפ.
      </p>

      <div className="mt-8 mx-auto max-w-sm rounded-[1.75rem] bg-card p-2 ring-1 ring-black/5 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.28)]">
        <div className="overflow-hidden rounded-[1.35rem] ring-1 ring-black/5">
          <Image
            src={SHOT}
            alt="שיחת וואטסאפ עם לקוח שמקבל קישור להקלטה"
            fittingType="fit"
            originWidth={984}
            originHeight={975}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}