"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import Card from "@/models/card/Card";
import Comment from "@/models/card/Comment";
import { ActivityType } from "@/types";
import { revalidatePath } from "next/cache";
import List from "@/models/board/List";

export async function createCard(formData: FormData) {
  const title = formData.get("title") as string;
  const listId = formData.get("listId") as string;
  const boardId = formData.get("boardId") as string;
  const orgId = formData.get("orgId") as string;

  const { user, org } = await validateOrgAccess(orgId, "member");

  await connectDB();
  const board = await Board.findOne({ _id: boardId, organizationId: org._id });
  if (!board) throw new Error("Board access denied");

  const maxPositionCard = await Card.findOne({ listId }).sort({ position: -1 });
  const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

  const card = await Card.create({
    title,
    listId,
    position,
    createdBy: user.id,
  });

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    cardId: card._id,
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

  await connectDB();
  const board = await Board.findOne({ _id: boardId, organizationId: org._id });
  if (!board) throw new Error("Board access denied");

  const card = await Card.findOneAndUpdate({ _id: cardId }, updates, {
    new: true,
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
    organizationId: org._id,
    boardId: board._id,
    cardId: card._id,
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

  await connectDB();

  const board = await Board.findOne({
    _id: boardId,
    organizationId: org._id,
  });

  if (!board) {
    throw new Error("Board access denied");
  }

  const lists = await List.find({
    boardId: board._id,
    archived: false,
  }).select("_id");

  const card = await Card.findOne({
    _id: cardId,
    listId: { $in: lists.map((l) => l._id) },
    archived: false,
  });

  if (!card) {
    throw new Error("Card not found in this board");
  }

  if (parentId) {
    const parent = await Comment.findOne({ _id: parentId, cardId });
    if (!parent) {
      throw new Error("Invalid parent comment");
    }
  }

  const comment = await Comment.create({
    cardId,
    authorId: user.id,
    content: text,
    parentId: parentId || null,
  });

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    cardId: card._id,
    actorId: user.id,
    type: "COMMENT_ADDED",
    message: `added comment on card "${card.title}"`,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);

  return {
    id: comment._id.toString(),
    cardId: comment.cardId.toString(),
    authorId: comment.authorId,
    content: comment.content,
    parentId: comment.parentId ? comment.parentId.toString() : null,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
