import { z } from "zod";

// Base fields for creating a card (used by both API & Server Action)
export const cardContentSchema = z.object({
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
  assigneeId: z.uuid("Invalid assignee ID").nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
  listId: z.uuid("List ID is required"),
});

// Server action schema: includes boardId and orgId passed via FormData
export const createCardSchema = cardContentSchema.extend({
  boardId: z.uuid("Board ID is required"),
  orgId: z.uuid("Organization ID is required"),
});

// API schema: boardId and orgId come from URL params and board lookup
export const createCardApiSchema = cardContentSchema;

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
  assigneeId: z.uuid().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export const updateCardsPatchSchema = z.object({
  cardId: z.uuid().optional(),
  targetListId: z.uuid().optional(),
  targetCardIds: z.array(z.uuid()).optional(),
  sourceListId: z.uuid().optional(),
  sourceCardIds: z.array(z.uuid()).optional(),
  cardIds: z.array(z.uuid()).optional(),
  listId: z.uuid().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  assigneeId: z.uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const addCommentSchema = z.object({
  cardId: z.uuid("Card ID is required"),
  boardId: z.uuid("Board ID is required"),
  orgId: z.uuid("Organization ID is required"),
  content: z
    .string()
    .trim()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters"),
  parentId: z.uuid().nullable().optional(),
});

export const deleteCardSchema = z.object({
  cardId: z.uuid("Card ID is required"),
  boardId: z.uuid("Board ID is required"),
  orgId: z.uuid("Organization ID is required"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type CreateCardApiInput = z.infer<typeof createCardApiSchema>;
export type UpdateCardDetailsInput = z.infer<typeof updateCardDetailsSchema>;
export type UpdateCardsPatchInput = z.infer<typeof updateCardsPatchSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
