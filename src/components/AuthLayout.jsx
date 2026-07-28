import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground">CALLECT</span>
          <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-foreground bg-primary mt-3 mb-5">
            {Icon ? <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" /> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground leading-none">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-3 font-mono text-xs uppercase tracking-[0.15em]">{subtitle}</p>}
        </div>
        <div className="border-2 border-foreground bg-card p-7">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-5 font-mono text-xs">{footer}</p>
        )}
      </div>
    </div>
  );
}