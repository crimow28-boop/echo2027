import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import DemoFlowCallCard from "@/components/demo/DemoFlowCallCard";
import DemoFlowBars from "@/components/demo/DemoFlowBars";
import DemoFlowRow from "@/components/demo/DemoFlowRow";

const ROWS = [
  { initial: "מ", color: "bg-pink-500", phone: "053-8942658", progress: 0 },
  { initial: "ג", color: "bg-indigo-500", phone: "052-9639572", progress: 42 },
  { initial: "א", color: "bg-sky-500", phone: "054-0452754", progress: 12 },
];

export default function DemoFlowAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % 4), step === 3 ? 2600 : 1100);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div dir="rtl" className="relative rounded-[1.75rem] bg-card/60 p-4 sm:p-6 ring-1 ring-black/5">
      <div className="flex gap-3">
        <DemoFlowCallCard label="לקוח" name="נועם בארי" visible={step >= 0} delay={0} />
        <DemoFlowCallCard label="העסק" name="מיכל שמעוני" visible={step >= 0} delay={0.15} />
      </div>

      <div className="mt-3 flex justify-center">
        <div className="h-6 w-px border-r border-dashed border-primary/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 0.97 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-black/5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]"
      >
        <Mic className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 overflow-hidden">
          <DemoFlowBars active={step >= 1} />
        </div>
      </motion.div>

      <div className="mt-3 flex justify-center">
        <div className="h-6 w-px border-r border-dashed border-primary/40" />
      </div>

      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl bg-muted/60 p-3 sm:p-4 ring-1 ring-black/5"
      >
        <p className="mb-3 font-heading text-sm">פירוט שיחות</p>
        <div className="space-y-2">
          {ROWS.map((r, i) => (
            <DemoFlowRow key={r.phone} {...r} visible delay={i * 0.12} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}