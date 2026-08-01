import React from "react";
import { ArrowRight, CheckCheck, Video, Phone } from "lucide-react";

const INCOMING = "היי, אני לקוחה שלכם כבר כמעט שנתיים. לאחרונה גיליתי שיש חיובים שלא ציפיתי להם, ואני לא זוכרת אם זה משהו שנאמר בשיחה. תוכלו לשלוח לי את ההקלטה?";

export default function DemoClientChat() {
  return (
    <div dir="rtl" className="rounded-xl overflow-hidden border border-border text-right">
      {/* Chat header */}
      <div className="flex items-center gap-3 bg-[#008069] px-3 py-2.5 text-white">
        <ArrowRight className="w-4 h-4 shrink-0 opacity-90" />
        <div className="w-8 h-8 rounded-full bg-white/25 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium truncate">מיכל לוי</p>
          <p className="text-[10px] text-white/80">מחובר</p>
        </div>
        <Video className="w-4 h-4 opacity-90" />
        <Phone className="w-4 h-4 opacity-90" />
      </div>

      {/* Chat body */}
      <div className="bg-[#efeae2] px-3 py-4 space-y-2">
        {/* Incoming — client */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-white px-2.5 py-1.5 shadow-sm">
            <p className="text-[13px] leading-relaxed text-[#111b21]">{INCOMING}</p>
            <div className="mt-0.5 text-[10px] text-[#667781]">
              <span dir="ltr">10:41</span>
            </div>
          </div>
        </div>

        {/* Outgoing — business */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-[#d9fdd3] px-2.5 py-1.5 shadow-sm">
            <p className="text-[13px] leading-relaxed text-[#111b21]">
              היי, כמובן. הנה קישור להקלטת השיחה שלנו (12.2.2024)
            </p>
            <p dir="ltr" className="mt-1.5 text-[13px] text-[#027eb5] underline break-all text-left">
              https://echo.so/r/8F2KQ
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#111b21]">
              אם יש לך שאלות נוספות, אנחנו כאן.
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#667781]">
              <span dir="ltr">10:42</span>
              <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}