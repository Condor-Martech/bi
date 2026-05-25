import { z } from "zod";

/**
 * Schemas + types + query keys for the `/users` module.
 *
 * Reference DTOs: legacy/app/src/app/modules/users/dto/{create-user,update-user,change-password}.dto.ts
 */

export const ROLES = ["manager", "admin", "user"] as const;
export type Role = (typeof ROLES)[number];

/** Mirror of legacy `UserResponseWithPopulateDto` (used by GET /users/all). */
export const userListItemSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
    userIslv: z.string().optional(),
    accountID: z
      .union([
        z.array(
          z
            .object({
              _id: z.string().optional(),
              nameAccount: z.string().optional(),
              email: z.string().optional(),
            })
            .passthrough(),
        ),
        z.array(z.string()),
      ])
      .optional(),
    groupByPB: z.array(z.string()).optional(),
    reportsByPB: z.array(z.string()).optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type UserListItem = z.infer<typeof userListItemSchema>;

/** Body for POST /users/create */
export interface CreateUserBody {
  name: string;
  email: string;
  role: Role;
  accountUser?: string;
  userIslv?: string;
  password?: string;
  groupIdPB?: string[];
  reportIdPB?: string[];
}

/** Body for PATCH /users/update/:id — same shape as CreateUserDto, all optional. */
export type UpdateUserBody = Partial<CreateUserBody>;

/** Body for PATCH /users/change-password */
export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
} as const;
