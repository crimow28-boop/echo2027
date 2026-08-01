import React from "react";
import { LifeBuoy } from "lucide-react";

export default function HelpNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <LifeBuoy className="w-5 h-5 text-primary shrink-0" />
      <div className="text-sm leading-relaxed">
        <p className="font-medium">צריכים עזרה בהטמעה?</p>
        <p className="mt-1 text-muted-foreground">
          פנו אלינו ונשמח לעזור — נעלה את ההודעה למרכזייה שלכם ונוודא שהכול עובד כמו שצריך.
        </p>
      </div>
    </div>
  );
}