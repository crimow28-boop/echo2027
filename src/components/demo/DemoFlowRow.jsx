import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function DemoFlowRow({ initial, color, phone, progress, delay, visible }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 ring-1 ring-black/5"
    >
      <span className={`w-8 h-8 shrink-0 rounded-full ${color} text-white flex items-center justify-center text-xs font-heading`}>
        {initial}
      </span>
      <span className="text-sm tabular-nums" dir="ltr">{phone}</span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={visible ? { width: `${progress}%` } : { width: 0 }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">1:56</span>
      </div>
      <Play className="w-4 h-4 text-primary shrink-0" />
    </motion.div>
  );
}