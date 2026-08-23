import { z } from "zod";

export const createCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Card title is required")
    .max(200, "Card title must not exceed 200 characters"),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .default(""),
  assigneeId: z.string().min(1).nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
  listId: z.string().min(1, "List ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
});

export const updateCardDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Card title is required")
    .max(200, "Card title must not exceed 200 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export const addCommentSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  content: z
    .string()
    .trim()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters"),
  parentId: z.string().min(1).nullable().optional(),
});

export const deleteCardSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardDetailsInput = z.infer<typeof updateCardDetailsSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
