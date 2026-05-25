import { z } from "zod";

/**
 * Schemas + keys for the `/maps` module (file uploads — typically map images).
 *
 * Reference: legacy/app/src/app/modules/maps/create-map.dto.ts
 * Upload returns `{ linkMap: { webUrl, ... } }`.
 */

export const mapSchema = z
  .object({
    _id: z.string(),
    name: z.string().optional(),
    webUrl: z.string().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type MapItem = z.infer<typeof mapSchema>;

export const uploadResponseSchema = z.object({
  linkMap: mapSchema.passthrough(),
});

export const mapsKeys = {
  all: ["maps"] as const,
  list: () => [...mapsKeys.all, "list"] as const,
  detail: (id: string) => [...mapsKeys.all, "detail", id] as const,
} as const;
