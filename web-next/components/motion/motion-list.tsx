"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { springs } from "@/lib/motion/transitions";

interface MotionListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Devuelve una key estable única por item. Requerido para que AnimatePresence funcione bien. */
  getItemKey: (item: T) => string | number;
  className?: string;
  itemClassName?: string;
  /** Default true. Si la lista renderiza items por primera vez sin animación inicial, dejá false. */
  animateInitial?: boolean;
}

export function MotionList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  itemClassName,
  animateInitial = true,
}: MotionListProps<T>) {
  return (
    <LayoutGroup>
      <ul className={className}>
        <AnimatePresence initial={animateInitial}>
          {items.map((item, index) => (
            <motion.li
              key={getItemKey(item)}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springs.list}
              className={itemClassName}
            >
              {renderItem(item, index)}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  );
}
