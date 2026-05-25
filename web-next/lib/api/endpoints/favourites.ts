import { z } from "zod";

/**
 * Schemas + query keys for the `/favourites` module.
 *
 * Legacy entity (favourite.entity.ts) is:
 *   { _id, userID, reportIdPB, order, createdAt, updatedAt }
 * + virtual `report` populated from the Report collection by reportIdPB.
 */

const reportRefSchema = z
  .object({
    _id: z.string().optional(),
    reportIdPB: z.string().optional(),
    name: z.string().optional(),
    embedUrl: z.string().optional(),
    webUrl: z.string().optional(),
  })
  .passthrough();

export const favouriteSchema = z
  .object({
    _id: z.string(),
    userID: z.string(),
    reportIdPB: z.string(),
    order: z.number(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
    /** Virtual populated by the legacy schema — may be a single object or an array depending on the route. */
    report: z.union([reportRefSchema, z.array(reportRefSchema)]).optional(),
  })
  .passthrough();

export type Favourite = z.infer<typeof favouriteSchema>;

/** Body of POST /favourites (see legacy CreateFavouriteDto). */
export interface CreateFavouriteBody {
  reportIdPB: string;
  order: number;
}

export const favouritesKeys = {
  all: ["favourites"] as const,
  me: () => [...favouritesKeys.all, "me"] as const,
} as const;
