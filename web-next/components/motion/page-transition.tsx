"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

import { durations, easings } from "@/lib/motion/transitions";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: durations.base, ease: easings.standard }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
