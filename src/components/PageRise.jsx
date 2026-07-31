import React from "react";
import { motion } from "framer-motion";

// Quick "rises from below" entrance for full pages (login, signup, etc.)
export default function PageRise({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}