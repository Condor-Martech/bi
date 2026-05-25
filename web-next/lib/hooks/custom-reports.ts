"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  customReportSchema,
  customReportsKeys,
  type CreateCustomReportBody,
  type CustomReport,
  type UpdateCustomReportBody,
} from "@/lib/api/endpoints/custom-reports";

export function useCustomReports() {
  return useQuery<CustomReport[]>({
    queryKey: customReportsKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/custom-reports");
      return z.array(customReportSchema).parse(data);
    },
  });
}

export function useCreateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomReportBody) =>
      apiClient("/api/custom-reports", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: customReportsKeys.all }),
  });
}

export function useUpdateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportIdPB,
      body,
    }: {
      reportIdPB: string;
      body: UpdateCustomReportBody;
    }) =>
      apiClient(`/api/custom-reports/${encodeURIComponent(reportIdPB)}`, {
        method: "PATCH",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: customReportsKeys.all }),
  });
}

export function useDeleteCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportIdPB: string) =>
      apiClient(`/api/custom-reports/${encodeURIComponent(reportIdPB)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: customReportsKeys.all }),
  });
}
