"use client";

import { motion } from "framer-motion";

interface ScrollTriggerProps {
  onViewportChange: (inView: boolean) => void;
}

export function ScrollTrigger({ onViewportChange }: ScrollTriggerProps) {
  return (
    <motion.div
      onViewportEnter={() => onViewportChange(true)}
      onViewportLeave={() => onViewportChange(false)}
      viewport={{
        once: false,
        margin: "-64px 0px 0px 0px",
      }}
      className="h-px w-full pointer-events-none"
    />
  );
}