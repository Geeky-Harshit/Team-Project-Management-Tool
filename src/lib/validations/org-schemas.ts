import { z } from "zod";

export const createOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name must not exceed 50 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes"),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
