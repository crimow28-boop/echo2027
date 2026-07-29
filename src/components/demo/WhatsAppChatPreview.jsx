import React from "react";
import { ArrowRight, CheckCheck, Mic, Play, Video, Phone } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/recordingUtils";

const fmt = (s) => {
  const m = Math.floor((s || 0) / 60);
  const sec = Math.floor((s || 0) % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const BARS = [6, 12, 8, 16, 10, 20, 14, 9, 18, 11, 7, 15, 19, 10, 13, 8, 16, 12, 6, 14, 9, 17, 11, 7];

export default function WhatsAppChatPreview({ recording, message }) {
  const time = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const name = recording?.callerFriendly || formatPhoneDisplay(recording?.callerNumber || "");

  return (
    <div dir="rtl" className="rounded-xl overflow-hidden border border-border">
      {/* Chat header */}
      <div className="flex items-center gap-3 bg-[#008069] px-3 py-2.5 text-white">
        <ArrowRight className="w-4 h-4 shrink-0 opacity-90" />
        <div className="w-8 h-8 rounded-full bg-white/25 shrink-0" />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[13px] font-medium truncate">{name}</p>
          <p className="text-[10px] text-white/80">מחובר</p>
        </div>
        <Video className="w-4 h-4 opacity-90" />
        <Phone className="w-4 h-4 opacity-90" />
      </div>

      {/* Chat body */}
      <div className="bg-[#efeae2] px-3 py-4 space-y-1.5 min-h-[190px]">
        {/* Text bubble (outgoing) */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-[#d9fdd3] px-2.5 py-1.5 shadow-sm">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-[#111b21] text-right">
              {message}
            </p>
            <div className="mt-0.5 flex items-center justify-start gap-1 text-[10px] text-[#667781]">
              <span dir="ltr">{time}</span>
              <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
            </div>
          </div>
        </div>

        {/* Voice note bubble (outgoing) */}
        <div className="flex justify-start">
          <div className="max-w-[85%] w-[260px] rounded-lg bg-[#d9fdd3] px-2.5 py-2 shadow-sm">
            <div dir="ltr" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-[#c8e6c0] shrink-0 flex items-center justify-center">
                <Mic className="w-4 h-4 text-[#667781]" />
              </div>
              <Play className="w-4 h-4 text-[#54656f] shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-[2px] h-6">
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="flex-1 rounded-full bg-[#9fb3a8]"
                  />
                ))}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#667781]">
              <span dir="ltr">{fmt(recording?.duration)}</span>
              <span className="flex items-center gap-1">
                <span dir="ltr">{time}</span>
                <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}