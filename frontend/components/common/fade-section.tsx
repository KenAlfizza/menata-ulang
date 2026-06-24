"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CenterTriggerProps {
  children: ReactNode;
  className?: string;
}

export function FadeInSection({ children, className = "" }: CenterTriggerProps) {
  return (
    <motion.div
      // 1. Starting hidden state
      initial={{ opacity: 0, y: 30 }}
      // 2. Animate to full visibility when triggered
      whileInView={{ opacity: 1, y: 0 }}
      // 3. Keep it visible once triggered
      viewport={{ 
        once: true, 
        // This margin creates a horizontal trigger line exactly at 50% viewport height
        margin: "-25% 0px -25% 0px" 
      }}
      // 4. Clean, smooth physics transition timing
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}