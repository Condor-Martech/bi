"use client";

import * as React from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion/transitions";
import { cn } from "@/lib/utils";

type MotionButtonProps = React.ComponentProps<typeof Button> & {
  /** Wrapper className (controla layout flow, no el botón). */
  wrapperClassName?: string;
};

export function MotionButton({
  wrapperClassName,
  ...props
}: MotionButtonProps) {
  return (
    <motion.span
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={springs.fast}
      className={cn("inline-block", wrapperClassName)}
    >
      <Button {...props} />
    </motion.span>
  );
}
