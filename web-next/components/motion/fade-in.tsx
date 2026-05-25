"use client";

import { motion } from "motion/react";

import { durations, easings } from "@/lib/motion/transitions";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Y-offset inicial en px (default 8). 0 = solo opacity. */
  offset?: number;
}

export function FadeIn({ children, delay = 0, className, offset = 8 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.base, ease: easings.standard, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
