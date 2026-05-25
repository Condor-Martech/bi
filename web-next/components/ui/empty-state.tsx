"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

function EmptyState({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <FadeIn>
      <div
        data-slot="empty-state"
        className={cn(
          "mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 px-6 py-12 text-center",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FadeIn>
  );
}

function EmptyStateIcon({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="empty-state-icon"
      className={cn(
        "text-muted-foreground bg-muted/40 mb-1 flex size-10 items-center justify-center rounded-md [&>svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn("text-foreground text-base font-semibold", className)}
      {...props}
    />
  );
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function EmptyStateActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn("mt-3 flex items-center justify-center gap-2", className)}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
};
