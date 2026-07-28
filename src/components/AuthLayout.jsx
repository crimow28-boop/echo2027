import React from "react";

const LOGO = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/736748188_Screenshot2026-07-28at231744-Photoroom1.png";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO} alt="echo" className="h-10 w-auto mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          {children}
        </div>
        {footer && <p className="text-center text-sm text-muted-foreground mt-5">{footer}</p>}
      </div>
    </div>
  );
}