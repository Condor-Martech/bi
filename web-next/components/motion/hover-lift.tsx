"use client";

import { motion } from "motion/react";

import { springs } from "@/lib/motion/transitions";

interface HoverLiftProps {
  children: React.ReactNode;
  /** Distancia que levanta en hover (px). Default 1. */
  lift?: number;
  /** Si true, también escala 1.01 en hover. Default false. */
  scaleOnHover?: boolean;
  className?: string;
}

export function HoverLift({
  children,
  lift = 1,
  scaleOnHover = false,
  className,
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -lift, scale: scaleOnHover ? 1.01 : 1 }}
      transition={springs.fast}
      className={className}
    >
      {children}
    </motion.div>
  );
}
