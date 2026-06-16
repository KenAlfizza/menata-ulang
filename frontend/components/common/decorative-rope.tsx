"use client";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

interface DecorativeRopeProps {
  src: string;
  className?: string;
  right?: boolean;
}

const getRopeVariants = (right?: boolean): Variants => ({
  hidden: { 
    clipPath: right ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" 
  },
  visible: { 
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 2, ease: "easeInOut" }
  }
});

export function DecorativeRope({ src, className, right }: DecorativeRopeProps) {
  // Generate the variant configuration based on the prop
  const variants = getRopeVariants(right);

  return (
    <div className={`w-full relative select-none pointer-events-none ${className}`}>
      <motion.div
        className="w-full"
        variants={variants}
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