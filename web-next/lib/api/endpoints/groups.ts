import { z } from "zod";

/**
 * Schemas + types + query keys for the `/groups` module (Power BI workspaces).
 *
 * Reference: legacy/app/src/app/modules/groups/groups.controller.ts
 */

export const groupReportSchema = z
  .object({
    _id: z.string().optional(),
    reportIdPB: z.string().optional(),
    name: z.string().optional(),
    embedUrl: z.string().optional(),
    webUrl: z.string().optional(),
    groupIdPB: z.string().optional(),
  })
  .passthrough();

export type GroupReport = z.infer<typeof groupReportSchema>;

export const groupSchema = z
  .object({
    _id: z.string().optional(),
    groupIdPB: z.string(),
    accountId: z.string().optional(),
    name: z.string().optional(),
    report: z.array(groupReportSchema).optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type Group = z.infer<typeof groupSchema>;

/** Response of GET /groups/all/:accountId */
export const groupsByAccountSchema = z.object({
  groups: z.array(groupSchema),
  countReports: z.number().optional(),
});

export type GroupsByAccount = z.infer<typeof groupsByAccountSchema>;

export const groupsKeys = {
  all: ["groups"] as const,
  byAccount: (accountId: string) => [...groupsKeys.all, "byAccount", accountId] as const,
} as const;
