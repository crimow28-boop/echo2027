import React from "react";
import { Check } from "lucide-react";
import { LINK_TOKEN } from "@/lib/messageTemplate";

export default function WhatsAppBubble({ message }) {
  const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const lines = (message || "").split("\n");

  return (
    <div dir="rtl" className="rounded-2xl bg-[#e6ddd4] p-4">
      <div className="flex justify-start">
        <div className="relative max-w-[85%] rounded-xl bg-white px-3 py-2 shadow-sm text-right">
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-[#111b21]">
            {lines.map((line, i) => (
              <div key={i}>
                {line === LINK_TOKEN ? (
                  <span className="text-[#027eb5] underline break-all">קישור להקלטה</span>
                ) : (
                  line || "\u00A0"
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
            <span dir="ltr">{time}</span>
            <Check className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}