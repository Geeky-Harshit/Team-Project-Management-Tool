import { z } from "zod";

export const createListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "List name is required")
    .max(100, "List name must not exceed 100 characters"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
});

export const renameListSchema = z.object({
  listId: z.string().min(1, "List ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  newName: z
    .string()
    .trim()
    .min(1, "List name is required")
    .max(100, "List name must not exceed 100 characters"),
});

export const deleteListSchema = z.object({
  listId: z.string().min(1, "List ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type RenameListInput = z.infer<typeof renameListSchema>;
export type DeleteListInput = z.infer<typeof deleteListSchema>;
