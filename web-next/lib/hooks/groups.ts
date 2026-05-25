"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import {
  groupsByAccountSchema,
  groupsKeys,
  type GroupsByAccount,
} from "@/lib/api/endpoints/groups";

/** GET /api/groups/all/:accountId — MANAGER only. Returns workspaces with their reports populated. */
export function useWorkspacesByAccount(accountId: string | undefined) {
  return useQuery<GroupsByAccount>({
    queryKey: groupsKeys.byAccount(accountId ?? "__none__"),
    enabled: Boolean(accountId),
    queryFn: async () => {
      const data = await apiClient(`/api/groups/all/${encodeURIComponent(accountId!)}`);
      return groupsByAccountSchema.parse(data);
    },
  });
}
