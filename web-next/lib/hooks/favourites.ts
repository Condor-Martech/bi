"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  favouriteSchema,
  favouritesKeys,
  type CreateFavouriteBody,
  type Favourite,
} from "@/lib/api/endpoints/favourites";

/**
 * GET /api/favourites/me — the legacy backend ignores the :userID param and uses
 * req.user.id internally (see favourites.controller.ts:54). We pass "me" as a
 * stable placeholder to keep cache keys stable.
 */
export function useMyFavourites() {
  return useQuery<Favourite[]>({
    queryKey: favouritesKeys.me(),
    queryFn: async () => {
      const data = await apiClient("/api/favourites/me");
      return z.array(favouriteSchema).parse(data);
    },
  });
}

interface ToggleArgs {
  reportIdPB: string;
  /** When favouriting, the next `order` value. When unfavouriting, ignored. */
  existing: Favourite | undefined;
  nextOrder: number;
}

/**
 * Toggle a report in/out of the user's favourites.
 *
 * - If `existing` is set → DELETE /favourites/:_id
 * - Otherwise           → POST  /favourites with `{ reportIdPB, order }`
 *
 * Optimistically updates the cache; rolls back on error.
 */
export function useToggleFavourite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportIdPB, existing, nextOrder }: ToggleArgs) => {
      if (existing) {
        await apiClient(`/api/favourites/${encodeURIComponent(existing._id)}`, {
          method: "DELETE",
        });
        return { action: "removed" as const, reportIdPB };
      }
      const body: CreateFavouriteBody = { reportIdPB, order: nextOrder };
      const data = await apiClient("/api/favourites", { method: "POST", body });
      return { action: "added" as const, favourite: favouriteSchema.parse(data) };
    },
    onMutate: async ({ reportIdPB, existing, nextOrder }) => {
      await qc.cancelQueries({ queryKey: favouritesKeys.me() });
      const previous = qc.getQueryData<Favourite[]>(favouritesKeys.me()) ?? [];
      if (existing) {
        qc.setQueryData<Favourite[]>(
          favouritesKeys.me(),
          previous.filter((f) => f._id !== existing._id),
        );
      } else {
        const optimistic: Favourite = {
          _id: `__optimistic-${reportIdPB}`,
          userID: "__pending",
          reportIdPB,
          order: nextOrder,
        };
        qc.setQueryData<Favourite[]>(favouritesKeys.me(), [...previous, optimistic]);
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(favouritesKeys.me(), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: favouritesKeys.me() });
    },
  });
}
