import React from "react";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";

export default function DemoFlowCallCard({ label, name, delay = 0, visible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.45, delay }}
      className="flex-1 min-w-0 flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-black/5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]"
    >
      <PhoneCall className="w-5 h-5 text-primary shrink-0" />
      <div className="min-w-0 text-right">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p className="font-heading text-sm sm:text-base truncate">{name}</p>
      </div>
    </motion.div>
  );
}