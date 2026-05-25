"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  accountSchema,
  accountsKeys,
  backupItemSchema,
  backupResponseSchema,
  type Account,
  type BackupItem,
  type CreateAccountBody,
  type RestoreBackupBody,
  type UpdateAccountBody,
} from "@/lib/api/endpoints/accounts";

/** GET /api/accounts — MANAGER only. Returns accounts with userCount derived server-side. */
export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: accountsKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/accounts");
      return z.array(accountSchema).parse(data);
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAccountBody) =>
      apiClient("/api/accounts/create", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKeys.all }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAccountBody }) =>
      apiClient(`/api/accounts/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKeys.all }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/accounts/remove/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKeys.all }),
  });
}

export function useBackups() {
  return useQuery<BackupItem[]>({
    queryKey: accountsKeys.backups(),
    queryFn: async () => {
      const data = await apiClient("/api/accounts/backups");
      return z.array(backupItemSchema).parse(data);
    },
  });
}

export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const data = await apiClient("/api/accounts/backup", { method: "POST" });
      return backupResponseSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKeys.backups() }),
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RestoreBackupBody) =>
      apiClient("/api/accounts/restore", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKeys.all }),
  });
}
