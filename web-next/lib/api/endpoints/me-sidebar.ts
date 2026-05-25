import { z } from "zod";

export const meSidebarWorkspaceSchema = z.object({
  id: z.string(),
  pbWorkspaceId: z.string(),
  name: z.string(),
});

export const meSidebarAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  workspaces: z.array(meSidebarWorkspaceSchema),
});

export type MeSidebarWorkspace = z.infer<typeof meSidebarWorkspaceSchema>;
export type MeSidebarAccount = z.infer<typeof meSidebarAccountSchema>;

export const meSidebarKeys = {
  all: ["me", "sidebar"] as const,
  list: () => [...meSidebarKeys.all] as const,
} as const;
