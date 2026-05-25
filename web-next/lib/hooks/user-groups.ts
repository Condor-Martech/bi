"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  userGroupSchema,
  userGroupsKeys,
  type CreateUserGroupBody,
  type UpdateUserGroupBody,
  type UserGroup,
} from "@/lib/api/endpoints/user-groups";

/** GET /api/user-groups — MANAGER only. */
export function useUserGroups() {
  return useQuery<UserGroup[]>({
    queryKey: userGroupsKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/user-groups");
      return z.array(userGroupSchema).parse(data);
    },
  });
}

export function useUserGroup(id: string | undefined) {
  return useQuery<UserGroup | null>({
    queryKey: id ? userGroupsKeys.detail(id) : ["user-groups", "detail", "__none"],
    queryFn: async () => {
      if (!id) return null;
      const data = await apiClient(`/api/user-groups/${encodeURIComponent(id)}`);
      return userGroupSchema.parse(data);
    },
    enabled: Boolean(id),
  });
}

export function useCreateUserGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserGroupBody) =>
      apiClient("/api/user-groups", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userGroupsKeys.all }),
  });
}

export function useUpdateUserGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserGroupBody }) =>
      apiClient(`/api/user-groups/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: userGroupsKeys.all });
      qc.invalidateQueries({ queryKey: userGroupsKeys.detail(id) });
    },
  });
}

export function useDeleteUserGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/user-groups/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userGroupsKeys.all }),
  });
}
