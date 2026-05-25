"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { easings } from "@/lib/motion/transitions";

interface MotionSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  /** Duración del loop de shimmer en segundos. Default 1.6. */
  duration?: number;
  "aria-label"?: string;
}

export function MotionSkeleton({
  className,
  style,
  duration = 1.6,
  "aria-label": ariaLabel,
}: MotionSkeletonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-slot="motion-skeleton"
      aria-label={ariaLabel}
      style={style}
      className={cn("bg-accent rounded-md", className)}
      animate={
        reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration, ease: easings.standard, repeat: Infinity }
      }
    />
  );
}
