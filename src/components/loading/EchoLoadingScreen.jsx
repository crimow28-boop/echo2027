import React from "react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function EchoLoadingScreen({ message = "מארגנים את השיחות שלך..." }) {
  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-background text-foreground font-body flex flex-col items-center justify-center gap-8 px-6 animate-in fade-in duration-300"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute w-32 h-32 rounded-full bg-primary/10 animate-ping motion-reduce:animate-none" />
        <span className="absolute w-24 h-24 rounded-full bg-primary/5" />
        <img src={LOGO} alt="echo" className="relative h-14 w-auto animate-pulse motion-reduce:animate-none" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground text-center">{message}</p>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary animate-[echo-slide_1.4s_ease-in-out_infinite] motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}