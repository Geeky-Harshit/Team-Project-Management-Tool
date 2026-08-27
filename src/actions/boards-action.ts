"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import {
  createBoardSchema,
  renameBoardSchema,
  boardActionSchema,
} from "@/lib/validations";
import { updateTag } from "next/cache";

export async function createBoard(formData: FormData) {
  const parsed = createBoardSchema.parse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
  });

  const { user, org } = await validateOrgAccess(
    parsed.organizationId,
    "member",
  );

  const board = await prisma.board.create({
    data: {
      name: parsed.name,
      organizationId: org.id,
    },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_CREATED",
    message: `created board "${parsed.name}"`,
  });

  updateTag(`board-${board.id}`);
  updateTag(`org-${org.id}-boards`);

  return {
    success: true,
  };
}

export async function renameBoard(
  boardId: string,
  orgId: string,
  newName: string,
) {
  const parsed = renameBoardSchema.parse({ boardId, orgId, newName });
  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.update({
    where: { id: parsed.boardId, organizationId: org.id },
    data: { name: parsed.newName },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_RENAMED",
    message: `renamed board to "${parsed.newName}"`,
  });

  // Invalidate both the individual board and the organization's boards list
  updateTag(`board-${board.id}`);
  updateTag(`org-${org.id}-boards`);

  return {
    success: true,
  };
}

export async function archiveBoard(boardId: string, orgId: string) {
  const parsed = boardActionSchema.parse({ boardId, orgId });
  const { user, org } = await validateOrgAccess(parsed.orgId, "member");

  const board = await prisma.board.update({
    where: { id: parsed.boardId, organizationId: org.id },
    data: { archived: true },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_ARCHIVED",
    message: `archived board "${board.name}"`,
  });

  // Invalidate both caches
  updateTag(`board-${board.id}`);
  updateTag(`org-${org.id}-boards`);

  return { success: true };
}

export async function restoreBoard(boardId: string, orgId: string) {
  const parsed = boardActionSchema.parse({ boardId, orgId });
  const { user, org } = await validateOrgAccess(parsed.orgId, "admin");

  const board = await prisma.board.update({
    where: { id: parsed.boardId, organizationId: org.id },
    data: { archived: false },
  });

  await logActivity({
    organizationId: org.id,
    boardId: board.id,
    actorId: user.id,
    type: "BOARD_RESTORED",
    message: `restored board "${board.name}"`,
  });

  // Invalidate both caches
  updateTag(`board-${board.id}`);
  updateTag(`org-${org.id}-boards`);

  return { success: true };
}
