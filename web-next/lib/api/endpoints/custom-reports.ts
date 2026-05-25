import { z } from "zod";

/**
 * Schemas + types + keys for the `/custom-reports` module.
 *
 * Reference: legacy/app/src/app/modules/custom-reports/dto/create-custom-report.dto.ts
 *
 * Note: the legacy `reportIdPB` is the FUNCTIONAL identifier used in routes
 * (PATCH/DELETE by reportIdPB), but it's also the value stored in the entity.
 * The legacy service appears to derive it from the URL or generate it on create.
 */

const authorSchema = z
  .object({
    _id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough();

export const customReportSchema = z
  .object({
    _id: z.string(),
    reportIdPB: z.string(),
    name: z.string(),
    url: z.string(),
    author: z.union([z.string(), authorSchema]).optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type CustomReport = z.infer<typeof customReportSchema>;

export interface CreateCustomReportBody {
  name: string;
  url: string;
  author: string;
}

export type UpdateCustomReportBody = Partial<CreateCustomReportBody>;

export const customReportsKeys = {
  all: ["custom-reports"] as const,
  list: () => [...customReportsKeys.all, "list"] as const,
  detail: (reportIdPB: string) => [...customReportsKeys.all, "detail", reportIdPB] as const,
} as const;
