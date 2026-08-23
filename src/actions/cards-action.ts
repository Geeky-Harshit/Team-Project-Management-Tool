"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import {
  createCardSchema,
  updateCardDetailsSchema,
  addCommentSchema,
  deleteCardSchema,
} from "@/lib/validations";
import { ActivityType } from "@/types";
import { revalidatePath } from "next/cache";

export async function createCard(formData: FormData) {
  const dueDateRaw = formData.get("dueDate") as string;
  const parsed = createCardSchema.parse({
    title: formData.get("title"),
    description: (formData.get("description") as string) || "",
    assigneeId: (formData.get("assigneeId") as string) || null,
    dueDate: dueDateRaw ? new Date(dueDateRaw).toISOString() : null,
    listId: formData.get("listId"),
    boardId: formData.get("boardId"),
    orgId: formData.get("orgId"),
  });

  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: parsed.boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const maxPositionCard = await prisma.card.findFirst({
    where: { listId: parsed.listId },
    orderBy: { position: "desc" },
  });
  const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

  const card = await prisma.card.create({
    data: {
      title: parsed.title,
      listId: parsed.listId,
      description: parsed.description,
      assigneeId: parsed.assigneeId,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      position,
      createdBy: user.id,
    },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    cardId: card.id,
    actorId: user.id,
    type: "CARD_CREATED",
    message: `created card "${parsed.title}"`,
  });

  revalidatePath(`/${org.slug}/boards/${parsed.boardId}`);
  return {
    success: true,
  };
}

export async function updateCardDetails(
  cardId: string,
  boardId: string,
  orgId: string,
  updates: {
    title?: string;
    description?: string;
    assigneeId?: string | null;
    dueDate?: Date | null;
  },
) {
  const parsed = updateCardDetailsSchema.parse(updates);
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const card = await prisma.card.update({
    where: { id: cardId },
    data: parsed,
  });

  let activityType: ActivityType = "CARD_UPDATED";
  let message = `updated card "${card.title}"`;

  if ("assigneeId" in parsed) {
    activityType = "CARD_ASSIGNED";
    message = parsed.assigneeId
      ? `assigned card "${card.title}"`
      : `unassigned card "${card.title}"`;
  }

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    cardId: card.id,
    actorId: user.id,
    type: activityType,
    message,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);
  return {
    success: true,
  };
}

export async function addComment(
  cardId: string,
  boardId: string,
  orgId: string,
  content: string,
  parentId?: string | null,
) {
  const parsed = addCommentSchema.parse({
    cardId,
    boardId,
    orgId,
    content,
    parentId,
  });

  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.findFirst({
    where: {
      id: parsed.boardId,
      organizationId: org.id,
    },
  });

  if (!board) {
    throw new Error("Board access denied");
  }

  const card = await prisma.card.findFirst({
    where: {
      id: parsed.cardId,
      list: { boardId: board.id, archived: false },
      archived: false,
    },
  });

  if (!card) {
    throw new Error("Card not found in this board");
  }

  if (parsed.parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parsed.parentId, cardId: parsed.cardId },
    });
    if (!parent) {
      throw new Error("Invalid parent comment");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      cardId: parsed.cardId,
      authorId: user.id,
      content: parsed.content,
      parentId: parsed.parentId || null,
    },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    cardId: card.id,
    actorId: user.id,
    type: "COMMENT_ADDED",
    message: `added comment on card "${card.title}"`,
  });

  revalidatePath(`/${org.slug}/boards/${parsed.boardId}`);

  return {
    id: comment.id,
    cardId: comment.cardId,
    authorId: comment.authorId,
    content: comment.content,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export async function deleteCard(cardId: string, boardId: string, orgId: string) {
  const parsed = deleteCardSchema.parse({ cardId, boardId, orgId });
  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: parsed.boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const card = await prisma.card.delete({
    where: { id: parsed.cardId },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "CARD_DELETED",
    message: `deleted card "${card.title}"`,
  });

  revalidatePath(`/${org.slug}/boards/${parsed.boardId}`);
}
