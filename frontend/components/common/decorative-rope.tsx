"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface DecorativeRopeProps {
  src: string;
  className?: string;
}

export function DecorativeRope({ src, className }: DecorativeRopeProps) {
  return (
    <div className={`w-full relative select-none pointer-events-none ${className}`}>
      <motion.div
        className="w-full"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt=""
          width={1920}
          height={729}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </div>
  );
}