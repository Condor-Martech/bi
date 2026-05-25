import { z } from "zod";

/**
 * Schemas + keys for the `/filters` module (row-level filters applied to PB reports).
 *
 * Reference: legacy/app/src/app/modules/filters/dto/create-filter.dto.ts
 * NOTE: Legacy preserves typos. Update endpoint is `PATCH /filters/upadate/:id`
 * and delete is `DELETE /filters/delete/:id`.
 */

export const filterSchema = z
  .object({
    _id: z.string(),
    table: z.string(),
    column: z.string(),
    value: z.string(),
    userId: z.string().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type Filter = z.infer<typeof filterSchema>;

export interface CreateFilterBody {
  table: string;
  column: string;
  value: string;
  userId: string;
}

export type UpdateFilterBody = Partial<CreateFilterBody>;

/** Item shape of `GET /filters/get/datasets` — Power BI datasets cached 6h. */
export const datasetSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    configuredBy: z.string().optional(),
    createdDate: z.string().optional(),
  })
  .passthrough();

export type Dataset = z.infer<typeof datasetSchema>;

/** Item shape of `GET /filters/tabelas/:id` — Power BI tables of a dataset. */
export const datasetTableSchema = z
  .object({
    name: z.string().optional(),
    columns: z
      .array(z.object({ name: z.string().optional() }).passthrough())
      .optional(),
  })
  .passthrough();

export type DatasetTable = z.infer<typeof datasetTableSchema>;

export const filtersKeys = {
  all: ["filters"] as const,
  list: () => [...filtersKeys.all, "list"] as const,
  detail: (id: string) => [...filtersKeys.all, "detail", id] as const,
  datasets: () => [...filtersKeys.all, "datasets"] as const,
  tables: (datasetId: string) => [...filtersKeys.all, "tables", datasetId] as const,
} as const;
