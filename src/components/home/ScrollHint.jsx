import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollHint({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-14 mx-auto flex flex-col items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <span>גללו למטה להיסטוריית השיחות</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-card shadow-[0_4px_14px_-8px_rgba(0,0,0,0.3)]"
      >
        <ChevronDown className="w-4 h-4 text-primary" />
      </motion.span>
    </button>
  );
}