"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBoard(formData: FormData) {
  const orgId = formData.get("organizationId") as string;
  const name = formData.get("name") as string;

  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.create({
    data: {
      name,
      organizationId: org.id,
    },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_CREATED",
    message: `created board "${name}"`,
  });

  revalidatePath(`/${org.slug}/boards`);
  return {
    success: true,
  };
}

export async function renameBoard(
  boardId: string,
  orgId: string,
  newName: string,
) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.update({
    where: { id: boardId, organizationId: org.id },
    data: { name: newName },
  });

  if (!board) throw new Error("Board not found");

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_RENAMED",
    message: `renamed board to "${newName}"`,
  });

  revalidatePath(`/${org.slug}/boards`);
  return {
    success: true,
  };
}

export async function archiveBoard(boardId: string, orgId: string) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  const board = await prisma.board.update({
    where: { id: boardId, organizationId: org.id },
    data: { archived: true },
  });

  if (!board) throw new Error("Board not found");

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_ARCHIVED",
    message: `archived board "${board.name}"`,
  });

  revalidatePath(`/${org.slug}/boards`);
  return { success: true };
}

export async function restoreBoard(boardId: string, orgId: string) {
  const { user, org } = await validateOrgAccess(orgId, "admin");

  const board = await prisma.board.update({
    where: { id: boardId, organizationId: org.id },
    data: { archived: false },
  });

  if (!board) throw new Error("Board not found");

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_RESTORED",
    message: `restored board "${board.name}"`,
  });

  revalidatePath(`/${org.slug}/boards/archived`, "page");
  revalidatePath(`/${org.slug}/boards`, "page");

  return { success: true };
}
