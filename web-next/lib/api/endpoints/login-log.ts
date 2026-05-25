import { z } from "zod";

/**
 * Schemas + types + keys for the `/login-log` module.
 *
 * Reference: legacy/app/src/app/modules/login-log/login-log.dto.ts
 * MANAGER-only audit endpoint.
 */

const loggedUserSchema = z
  .object({
    _id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough();

export const loginLogSchema = z
  .object({
    _id: z.string(),
    user: z.union([z.string(), loggedUserSchema]).optional(),
    /**
     * Legacy stores a string built with `Date.toString()` in Brasilia time —
     * `'Wed Jul 03 2024 18:03:38 GMT-0300 (Brasilia Standard Time)'`. Don't
     * try to parse strictly; we render it as-is and best-effort to Date.
     */
    loginTime: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type LoginLog = z.infer<typeof loginLogSchema>;

export const loginLogKeys = {
  all: ["login-log"] as const,
  list: () => [...loginLogKeys.all, "list"] as const,
  byUser: (userId: string) => [...loginLogKeys.all, "user", userId] as const,
} as const;
