import { Card, List, Activity, Comment, ActivityType } from "@/types";

export function toCard(row: {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: Date | string | null;
  position: string;
  archived: boolean;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): Card {
  return {
    id: row.id,
    listId: row.listId,
    title: row.title,
    description: row.description || "",
    assigneeId: row.assigneeId,
    dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : null,
    position: row.position,
    archived: row.archived,
    createdBy: row.createdBy,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export function toList(row: {
  id: string;
  boardId: string;
  name: string;
  position: string;
  archived: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}): List {
  return {
    id: row.id,
    boardId: row.boardId,
    name: row.name,
    position: row.position,
    archived: row.archived,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export function toActivity(row: {
  id: string;
  organizationId: string;
  boardId: string | null;
  cardId: string | null;
  actorId: string;
  type: string;
  message: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}): Activity {
  return {
    id: row.id,
    organizationId: row.organizationId,
    boardId: row.boardId,
    cardId: row.cardId,
    actorId: row.actorId,
    type: row.type as ActivityType,
    message: row.message,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
  };
}

export function toComment(row: {
  id: string;
  cardId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): Comment {
  return {
    id: row.id,
    cardId: row.cardId,
    authorId: row.authorId,
    content: row.content,
    parentId: row.parentId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}