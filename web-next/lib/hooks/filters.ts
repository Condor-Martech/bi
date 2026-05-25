"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  datasetSchema,
  datasetTableSchema,
  filterSchema,
  filtersKeys,
  type CreateFilterBody,
  type Dataset,
  type DatasetTable,
  type Filter,
  type UpdateFilterBody,
} from "@/lib/api/endpoints/filters";

export function useFilters() {
  return useQuery<Filter[]>({
    queryKey: filtersKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/filters");
      return z.array(filterSchema).parse(data);
    },
  });
}

export function useCreateFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFilterBody) =>
      apiClient("/api/filters", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: filtersKeys.all }),
  });
}

export function useUpdateFilter() {
  const qc = useQueryClient();
  return useMutation({
    // Legacy preserves the typo: `upadate` (not `update`).
    mutationFn: ({ id, body }: { id: string; body: UpdateFilterBody }) =>
      apiClient(`/api/filters/upadate/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: filtersKeys.all }),
  });
}

export function useDeleteFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/filters/delete/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: filtersKeys.all }),
  });
}

/**
 * GET /api/filters/get/datasets — Power BI datasets, cached 6h server-side.
 * The response may be `{ value: [...] }` or `[...]` depending on legacy version.
 */
export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: filtersKeys.datasets(),
    queryFn: async () => {
      const data = await apiClient("/api/filters/get/datasets");
      const items = Array.isArray(data)
        ? data
        : ((data as { value?: unknown[] }).value ?? []);
      return z.array(datasetSchema).parse(items);
    },
    staleTime: 60 * 60 * 1000, // 1h on the client (legacy caches 6h)
  });
}

/** GET /api/filters/tabelas/:datasetId — tables of a Power BI dataset. */
export function useDatasetTables(datasetId: string | undefined) {
  return useQuery<DatasetTable[]>({
    queryKey: datasetId ? filtersKeys.tables(datasetId) : ["filters", "tables", "__none"],
    queryFn: async () => {
      if (!datasetId) return [];
      const data = await apiClient(`/api/filters/tabelas/${encodeURIComponent(datasetId)}`);
      const items = Array.isArray(data)
        ? data
        : ((data as { value?: unknown[] }).value ?? []);
      return z.array(datasetTableSchema).parse(items);
    },
    enabled: Boolean(datasetId),
    staleTime: 60 * 60 * 1000,
  });
}
