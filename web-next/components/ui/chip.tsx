import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-medium leading-none transition-colors whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        blue:    "bg-blue-soft text-twenty-blue",
        green:   "bg-green-soft text-twenty-green",
        red:     "bg-red-soft text-twenty-red",
        orange:  "bg-orange-soft text-twenty-orange",
        purple:  "bg-purple-soft text-twenty-purple",
        pink:    "bg-pink-soft text-twenty-pink",
        gray:    "bg-gray-soft text-twenty-gray",
        outline: "border-border text-foreground bg-transparent",
      },
      size: {
        sm: "h-5 px-1.5 text-[11px]",
        md: "h-6 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "gray",
      size: "sm",
    },
  },
);

interface ChipProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof chipVariants> {
  asChild?: boolean;
}

function Chip({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ChipProps) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="chip"
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Chip, chipVariants, type ChipProps };
