import React from "react";
import { User, Headphones } from "lucide-react";

export default function TranscriptChat({ messages }) {
  return (
    <div className="space-y-2.5">
      {messages.map((m, i) => {
        const isCaller = m.speaker === "caller";
        return (
          <div key={i} className={`flex items-end gap-2 ${isCaller ? "justify-start" : "justify-end"}`}>
            {isCaller && (
              <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                isCaller
                  ? "bg-muted text-foreground rounded-bl-md"
                  : "bg-primary/10 text-foreground rounded-br-md"
              }`}
            >
              <p className="text-[11px] mb-1 text-muted-foreground">{isCaller ? "הלקוח" : "העסק"}</p>
              <p style={{ unicodeBidi: "plaintext" }}>{m.text}</p>
            </div>
            {!isCaller && (
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5 text-primary" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}