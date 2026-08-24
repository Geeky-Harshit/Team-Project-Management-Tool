import { z } from "zod";

export const createInviteSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z
    .email("Please provide a valid email address"),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
});

export const deleteInviteSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  token: z.string().min(1, "Invite token is required"),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type DeleteInviteInput = z.infer<typeof deleteInviteSchema>;
