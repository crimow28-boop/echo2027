import React from "react";
import { motion } from "framer-motion";

const HEIGHTS = [8, 14, 22, 30, 18, 26, 12, 34, 20, 10, 24, 16, 28, 12, 20, 32, 14, 22, 10, 26, 18, 30, 12, 20, 8, 24, 16, 28, 22, 10];

export default function DemoFlowBars({ active }) {
  return (
    <div className="flex items-center gap-[3px] h-9">
      {HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-primary/70"
          initial={{ height: 4, opacity: 0.25 }}
          animate={active ? { height: h, opacity: 1 } : { height: 4, opacity: 0.25 }}
          transition={{ duration: 0.35, delay: active ? i * 0.03 : 0 }}
        />
      ))}
    </div>
  );
}