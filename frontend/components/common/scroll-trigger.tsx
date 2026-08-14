"use client";

import { motion } from "framer-motion";

interface ScrollTriggerProps {
    children?: React.ReactNode;
    onViewportChange: (inView: boolean) => void;
}

export function ScrollTrigger({ children, onViewportChange }: ScrollTriggerProps) {
  return (
    <motion.div
      onViewportEnter={() => onViewportChange(true)}
      onViewportLeave={() => onViewportChange(false)}
      viewport={{
        once: false,
        margin: "-64px 0px 0px 0px",
      }}
      className={`h-full w-full`}
    >{children}</motion.div>
  );
}