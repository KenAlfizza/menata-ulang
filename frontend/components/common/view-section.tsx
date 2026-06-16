"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CenterTriggerProps {
    children: ReactNode;
    className?: string;
    margin?: string;
}

const parentVariants = {
    hidden: {},
    visible: {}
};

export function ViewSection({ children, className = "", margin ="-25% 0px -25% 0px"}: CenterTriggerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible" 
            viewport={{
                once: true,
                margin: margin
            }}
            variants={parentVariants}
            className={className}
        > 
            {children}
        </motion.div>
    );
}