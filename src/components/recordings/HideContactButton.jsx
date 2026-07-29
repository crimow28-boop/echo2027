import React from "react";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HideContactButton({ onClick, withLabel = false }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      title="הסתרת שיחות עם איש קשר זה"
      className={`gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground shadow-none ${withLabel ? "h-8 px-2.5" : "h-8 w-8 p-0"}`}
    >
      <EyeOff className="w-3.5 h-3.5" />
      {withLabel && <span>הסתרת שיחות עם איש קשר זה</span>}
    </Button>
  );
}