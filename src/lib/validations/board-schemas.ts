import { z } from "zod";

export const createBoardSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Board name is required")
        .max(100, "Board name must not exceed 100 characters"),
    organizationId: z.string().min(1, "Organization ID is required"),
});

export const renameBoardSchema = z.object({
    boardId: z.string().min(1, "Board ID is required"),
    orgId: z.string().min(1, "Organization ID is required"),
    newName: z
        .string()
        .trim()
        .min(1, "Board name is required")
        .max(100, "Board name must not exceed 100 characters"),
});

export const boardActionSchema = z.object({
    boardId: z.string().min(1, "Board ID is required"),
    orgId: z.string().min(1, "Organization ID is required"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type RenameBoardInput = z.infer<typeof renameBoardSchema>;
export type BoardActionInput = z.infer<typeof boardActionSchema>;
