import React from "react";

// Shows a transcript as a chat conversation: the business side on one row,
// the client on the other.
export default function TranscriptBubbles({ transcript }) {
  return (
    <div className="space-y-2.5">
      {transcript.map((seg, i) => {
        const isAgent = seg.speaker === "agent";
        return (
          <div key={i} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                isAgent
                  ? "bg-muted text-foreground rounded-bl-md"
                  : "bg-primary/10 text-foreground rounded-br-md"
              }`}
            >
              <div className="text-[11px] text-muted-foreground mb-0.5">
                {isAgent ? "העסק" : "הלקוח"}
              </div>
              {seg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}