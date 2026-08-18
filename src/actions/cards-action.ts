"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/types";
import { revalidatePath } from "next/cache";

export async function createCard(formData: FormData) {
  const title = formData.get("title") as string;
  const listId = formData.get("listId") as string;
  const boardId = formData.get("boardId") as string;
  const orgId = formData.get("orgId") as string;
  const description = (formData.get("description") as string) || "";
  const assigneeId = (formData.get("assigneeId") as string) || null;
  const dueDateStr = formData.get("dueDate") as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const maxPositionCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
  });
  const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

  const card = await prisma.card.create({
    data: {
      title,
      listId,
      description,
      assigneeId,
      dueDate,
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
    message: `created card "${title}"`,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);
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
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const card = await prisma.card.update({
    where: { id: cardId },
    data: updates,
  });
  if (!card) throw new Error("Card not found");

  let activityType: ActivityType = "CARD_UPDATED";
  let message = `updated card "${card.title}"`;

  if ("assigneeId" in updates) {
    activityType = "CARD_ASSIGNED";
    message = updates.assigneeId
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
}

export async function addComment(
  cardId: string,
  boardId: string,
  orgId: string,
  content: string,
  parentId?: string | null,
) {
  const { user, org } = await validateOrgAccess(orgId, "member");
  const text = content.trim();

  if (!text) {
    throw new Error("Comment cannot be empty");
  }

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId: org.id,
    },
  });

  if (!board) {
    throw new Error("Board access denied");
  }

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      list: { boardId: board.id, archived: false },
      archived: false,
    },
  });

  if (!card) {
    throw new Error("Card not found in this board");
  }

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, cardId },
    });
    if (!parent) {
      throw new Error("Invalid parent comment");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      cardId,
      authorId: user.id,
      content: text,
      parentId: parentId || null,
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

  revalidatePath(`/${org.slug}/boards/${boardId}`);

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
