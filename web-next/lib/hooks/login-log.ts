"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  loginLogKeys,
  loginLogSchema,
  type LoginLog,
} from "@/lib/api/endpoints/login-log";

/** GET /api/login-log/all — MANAGER only. Full login audit. */
export function useLoginLogs() {
  return useQuery<LoginLog[]>({
    queryKey: loginLogKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/login-log/all");
      return z.array(loginLogSchema).parse(data);
    },
    staleTime: 30_000,
  });
}

/** GET /api/login-log/:id — MANAGER only. Logs for a specific user. */
export function useLoginLogsByUser(userId: string | undefined) {
  return useQuery<LoginLog[]>({
    queryKey: userId ? loginLogKeys.byUser(userId) : ["login-log", "user", "__none"],
    queryFn: async () => {
      if (!userId) return [];
      const data = await apiClient(`/api/login-log/${encodeURIComponent(userId)}`);
      return z.array(loginLogSchema).parse(data);
    },
    enabled: Boolean(userId),
  });
}
