import { z } from "zod";

/**
 * Schemas + types + query keys for the `/user-groups` module.
 *
 * Reference: legacy/app/src/app/modules/user-groups/dto/create-user-group.dto.ts
 */

export const userGroupSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    accountID: z.string(),
    users: z.array(z.string()).optional(),
    reports: z.array(z.string()).optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type UserGroup = z.infer<typeof userGroupSchema>;

/** Body for POST /user-groups. Note: `users` is singular string per legacy DTO. */
export interface CreateUserGroupBody {
  name: string;
  accountID: string;
  users: string;
  reports: string[];
}

/** Body for PATCH /user-groups/:groupId — partial. */
export type UpdateUserGroupBody = Partial<CreateUserGroupBody> & {
  /** Plural form accepted by legacy when replacing membership in bulk. */
  usersIds?: string[];
};

export const userGroupsKeys = {
  all: ["user-groups"] as const,
  list: () => [...userGroupsKeys.all, "list"] as const,
  detail: (id: string) => [...userGroupsKeys.all, "detail", id] as const,
} as const;
