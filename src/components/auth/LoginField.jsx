import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginField({ id, label, icon: Icon, inputClassName = "", dir = "rtl", ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="relative rounded-2xl bg-muted/40 border border-border/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border/70 text-primary shadow-sm">
          <Icon className="w-4 h-4" />
        </span>
        <Input
          id={id}
          dir={dir}
          style={{ unicodeBidi: "plaintext" }}
          className={`h-14 pl-16 pr-5 text-right text-lg leading-normal bg-transparent border-0 shadow-none rounded-2xl focus-visible:ring-0 ${inputClassName}`}
          {...props}
        />
      </div>
    </div>
  );
}