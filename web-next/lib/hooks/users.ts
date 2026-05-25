"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  userListItemSchema,
  usersKeys,
  type ChangePasswordBody,
  type CreateUserBody,
  type UpdateUserBody,
  type UserListItem,
} from "@/lib/api/endpoints/users";

/** GET /api/users/all — MANAGER only. */
export function useUsers() {
  return useQuery<UserListItem[]>({
    queryKey: usersKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/users/all");
      return z.array(userListItemSchema).parse(data);
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) =>
      apiClient("/api/users/create", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) =>
      apiClient(`/api/users/update/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/users/delete/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      apiClient("/api/users/change-password", { method: "PATCH", body }),
  });
}

/**
 * PATCH /api/users/:userId/reports — MANAGER only.
 * Body: `{ reportIdPB: string[] }`. Backend derives `groupIdPB` from the reports automatically.
 */
export function useUpdateUserReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reportIdPB }: { userId: string; reportIdPB: string[] }) =>
      apiClient(`/api/users/${encodeURIComponent(userId)}/reports`, {
        method: "PATCH",
        body: { reportIdPB },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}
