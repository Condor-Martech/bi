import type { Transition } from "motion/react";

export const springs = {
  default: { type: "spring", stiffness: 400, damping: 30 },
  fast: { type: "spring", stiffness: 500, damping: 28 },
  gentle: { type: "spring", stiffness: 260, damping: 30 },
  list: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
} satisfies Record<string, Transition>;

export const easings = {
  standard: [0.32, 0.72, 0, 1] as const,
  emphasis: [0.16, 1, 0.3, 1] as const,
} satisfies Record<string, readonly [number, number, number, number]>;

export const durations = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
} satisfies Record<string, number>;

export type SpringPreset = keyof typeof springs;
export type EasingPreset = keyof typeof easings;
export type DurationPreset = keyof typeof durations;
