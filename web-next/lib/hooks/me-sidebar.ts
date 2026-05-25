"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  meSidebarAccountSchema,
  meSidebarKeys,
  type MeSidebarAccount,
} from "@/lib/api/endpoints/me-sidebar";

export function useMeSidebar() {
  return useQuery<MeSidebarAccount[]>({
    queryKey: meSidebarKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/me/sidebar");
      return z.array(meSidebarAccountSchema).parse(data);
    },
    staleTime: 5 * 60_000,
  });
}
