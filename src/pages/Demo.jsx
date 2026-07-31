import React from "react";
import { Link } from "react-router-dom";
import DemoCtaButtons from "@/components/demo/DemoCtaButtons";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoPlayground from "@/components/demo/DemoPlayground";
import DemoWhatsAppShot from "@/components/demo/DemoWhatsAppShot";

export default function Demo() {
  return (
    <div dir="rtl" className="min-h-screen bg-transparent bg-grid text-foreground font-body">
      <DemoHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14">
        <section className="text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
            כל הקלטות השיחות של העסק.
            <br />
            <span className="text-primary">במקום אחד.</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            חפשו כל שיחה לפי שם, מספר או תאריך, והעבירו אותה ללקוח תוך שניות.
          </p>
          <div className="mt-7">
            <DemoCtaButtons />
          </div>
        </section>

        <section>
          <DemoWhatsAppShot />
        </section>

        <section>
          <p className="font-heading text-xl text-center">וככה זה נראה אצליכם</p>
          <div className="mt-6">
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
    </div>
  );
}