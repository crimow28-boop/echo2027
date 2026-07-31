import React from "react";
import { Link } from "react-router-dom";
import DemoCtaButtons from "@/components/demo/DemoCtaButtons";
import DemoFlowAnimation from "@/components/demo/DemoFlowAnimation";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoHeroArt from "@/components/demo/DemoHeroArt";
import DemoPlayground from "@/components/demo/DemoPlayground";
import DemoWhatsAppShot from "@/components/demo/DemoWhatsAppShot";

export default function Demo() {
  return (
    <div dir="rtl" className="min-h-screen bg-transparent bg-grid text-foreground font-body">
      <DemoHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14">
        <section className="text-center rounded-[2rem] bg-card/80 backdrop-blur px-5 sm:px-10 py-10 sm:py-14 ring-1 ring-black/5 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.28)]">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
            כל הקלטות השיחות של העסק
            <br />
            <span className="text-primary">במקום אחד</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            חפשו כל שיחה לפי שם, מספר או תאריך, והעבירו אותה ללקוח תוך שניות.
          </p>
          <div className="mt-7">
            <DemoCtaButtons />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">פתיחת חשבון בחינם, בלי כרטיס אשראי.</p>
          <DemoHeroArt />
        </section>

        <section>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] tracking-wide text-muted-foreground">
              איך זה עובד
            </span>
            <p className="mt-4 font-heading text-2xl tracking-tight">כל שיחה נכנסת — נשמרת אצלכם</p>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground max-w-sm mx-auto">
              השיחה מוקלטת אוטומטית ומגיעה ישר לרשימת השיחות במערכת.
            </p>
          </div>
          <div className="mt-8">
            <DemoFlowAnimation />
          </div>
        </section>

        <section>
          <DemoWhatsAppShot />
        </section>

        <section>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] tracking-wide text-muted-foreground">
              המערכת
            </span>
            <p className="mt-4 font-heading text-2xl tracking-tight">וככה זה נראה אצליכם</p>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground max-w-sm mx-auto">
              מחפשים את השיחה, מאזינים, ושולחים בלחיצה.
            </p>
          </div>
          <div className="mt-8">
            <DemoPlayground />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-heading text-xl">מוכנים להתחיל?</p>
          <p className="mt-2 text-sm text-muted-foreground">פותחים חשבון בכמה פרטים, או מתחברים עם מספר החשבון שקיבלתם.</p>
          <div className="mt-5">
            <DemoCtaButtons size="sm" />
          </div>
        </section>
      </div>
    </div>);

}