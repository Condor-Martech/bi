import { z } from "zod";

/**
 * Schemas + types + query keys for the `/accounts` module.
 *
 * Reference: legacy/app/src/app/modules/accounts/dto/{create-account,update-account}.dto.ts
 * Accounts store Azure AD credentials per Power BI tenant.
 */

export const accountSchema = z
  .object({
    _id: z.string(),
    nameAccount: z.string(),
    email: z.string(),
    clientId: z.string().optional(),
    tenantId: z.string().optional(),
    /** Live Azure access token — present on detail/related responses, not always on list. */
    token: z.string().optional(),
    /** Server returns userCount via getUserCount() on detail; on list it's derived too. */
    userCount: z.number().optional(),
    users: z.array(z.string()).optional(),
    expiresIn: z.string().optional(),
    expiresOn: z.string().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type Account = z.infer<typeof accountSchema>;

/** Body for POST /accounts/create — Azure AD credentials. */
export interface CreateAccountBody {
  nameAccount: string;
  email: string;
  pass: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export type UpdateAccountBody = Partial<CreateAccountBody>;

/** Body for POST /accounts/restore */
export interface RestoreBackupBody {
  fileName: string;
}

/** Response of POST /accounts/backup */
export const backupResponseSchema = z.object({
  file: z.string(),
});

/** Item shape of GET /accounts/backups */
export const backupItemSchema = z
  .object({
    name: z.string().optional(),
    fileName: z.string().optional(),
    size: z.number().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type BackupItem = z.infer<typeof backupItemSchema>;

export const accountsKeys = {
  all: ["accounts"] as const,
  list: () => [...accountsKeys.all, "list"] as const,
  detail: (id: string) => [...accountsKeys.all, "detail", id] as const,
  backups: () => [...accountsKeys.all, "backups"] as const,
} as const;
