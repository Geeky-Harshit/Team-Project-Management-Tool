"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createList(formData: FormData) {
  const name = formData.get("name") as string;
  const boardId = formData.get("boardId") as string;
  const orgId = formData.get("orgId") as string;

  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const maxPositionList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });
  const position = maxPositionList ? maxPositionList.position + 1000 : 1000;

  await prisma.list.create({
    data: {
      name,
      boardId,
      position,
    },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "LIST_CREATED",
    message: `created list "${name}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);
}

export async function renameList(listId: string, boardId: string, orgId: string, newName: string) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  await prisma.list.update({
    where: { id: listId, boardId },
    data: { name: newName },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "LIST_RENAMED",
    message: `renamed list to "${newName}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);
}

export async function deleteList(listId: string, boardId: string, orgId: string) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: org.id },
  });
  if (!board) throw new Error("Board access denied");

  const list = await prisma.list.delete({
    where: { id: listId, boardId },
  });
  if (!list) throw new Error("List not found");

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "LIST_DELETED",
    message: `deleted list "${list.name}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.slug}/boards/${boardId}`);
}
