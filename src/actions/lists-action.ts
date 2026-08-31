"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import {
  createListSchema,
  renameListSchema,
  deleteListSchema,
} from "@/lib/validations";
import { updateTag } from "next/cache";

export type ListFormState = { ok: boolean; error?: string };

export async function createList(
  _prev: ListFormState,
  formData: FormData,
): Promise<ListFormState> {
  try {
    const parsed = createListSchema.parse({
      name: formData.get("name"),
      boardId: formData.get("boardId"),
      orgId: formData.get("orgId"),
    });

    const { user, org } = await validateOrgAccess(parsed.orgId, "member");

    const board = await prisma.board.findFirst({
      where: { id: parsed.boardId, organizationId: org.id },
    });
    if (!board) throw new Error("Board access denied");

    const maxPositionList = await prisma.list.findFirst({
      where: { boardId: parsed.boardId },
      orderBy: { position: "desc" },
    });
    const position = maxPositionList ? maxPositionList.position + 1000 : 1000;

    await prisma.list.create({
      data: {
        name: parsed.name,
        boardId: parsed.boardId,
        position,
      },
    });

    await logActivity({
      organizationId: org.id,
      boardId: board.id,
      actorId: user.id,
      type: "LIST_CREATED",
      message: `created list "${parsed.name}" on board "${board.name}"`,
    });

    updateTag(`board-${parsed.boardId}`);
    updateTag(`org-${org.id}-boards`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create list",
    };
  }
}

export async function renameList(
  listId: string,
  boardId: string,
  orgId: string,
  newName: string,
) {
  const parsed = renameListSchema.parse({ listId, boardId, orgId, newName });
  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: parsed.boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  await prisma.list.update({
    where: { id: parsed.listId, boardId: parsed.boardId },
    data: { name: parsed.newName },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "LIST_RENAMED",
    message: `renamed list to "${parsed.newName}" on board "${board.name}"`,
  });

  updateTag(`board-${parsed.boardId}`);
  updateTag(`org-${org.id}-boards`);
}

export async function deleteList(
  listId: string,
  boardId: string,
  orgId: string,
) {
  const parsed = deleteListSchema.parse({ listId, boardId, orgId });
  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: parsed.boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const list = await prisma.list.delete({
    where: { id: parsed.listId, boardId: parsed.boardId },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "LIST_DELETED",
    message: `deleted list "${list.name}" on board "${board.name}"`,
  });

  updateTag(`board-${parsed.boardId}`);
  updateTag(`org-${org.id}-boards`);
}
