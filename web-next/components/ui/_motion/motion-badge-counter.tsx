"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { springs } from "@/lib/motion/transitions";
import { cn } from "@/lib/utils";

interface MotionBadgeCounterProps {
  count: number;
  /** Cap visual del contador. Si count > max, muestra `${max}+`. Default 99. */
  max?: number;
  className?: string;
}

export function MotionBadgeCounter({
  count,
  max = 99,
  className,
}: MotionBadgeCounterProps) {
  const reduceMotion = useReducedMotion();
  const display = count > max ? `${max}+` : String(count);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={display}
        initial={
          reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }
        }
        animate={
          reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }
        }
        exit={
          reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }
        }
        transition={springs.fast}
        className={cn("inline-block tabular-nums", className)}
      >
        {display}
      </motion.span>
    </AnimatePresence>
  );
}
