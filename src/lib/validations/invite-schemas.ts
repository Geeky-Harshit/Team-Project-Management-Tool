import { z } from "zod";

export const createInviteSchema = z.object({
  organizationId: z.uuid("Organization ID is required"),
  email: z
    .email("Please provide a valid email address"),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
});

export const deleteInviteSchema = z.object({
  organizationId: z.uuid("Organization ID is required"),
  token: z.uuid("Invite token is required"),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type DeleteInviteInput = z.infer<typeof deleteInviteSchema>;
