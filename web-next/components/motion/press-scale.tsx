"use client";

import { motion } from "motion/react";

import { springs } from "@/lib/motion/transitions";

interface PressScaleProps {
  children: React.ReactNode;
  /** Factor de escala al presionar. Default 0.98 (Linear-like). */
  scale?: number;
  className?: string;
}

export function PressScale({ children, scale = 0.98, className }: PressScaleProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={springs.fast}
      className={className}
    >
      {children}
    </motion.div>
  );
}
