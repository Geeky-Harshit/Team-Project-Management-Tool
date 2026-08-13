"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import { revalidatePath } from "next/cache";

export async function createBoard(formData: FormData) {
  
  const orgId = formData.get("organizationId") as string;
  const name = formData.get("name") as string;

  const { user, org } = await validateOrgAccess(orgId, "member");

  await connectDB();
  const board = await Board.create({
    name,
    organizationId: org._id,
    createdBy: user.id,
  });

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "BOARD_CREATED",
    message: `created board "${name}"`,
  });

  revalidatePath(`/${org.orgSlug}/boards`);
}

export async function renameBoard(boardId: string, orgSlug: string, newName: string) {
  const { user, org } = await validateOrgAccess(orgSlug, "member");

  await connectDB();
  const board = await Board.findOneAndUpdate(
    { _id: boardId, organizationId: org._id },
    { name: newName },
    { new: true }
  );

  if (!board) throw new Error("Board not found");

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "BOARD_RENAMED",
    message: `renamed board to "${newName}"`,
  });

  revalidatePath(`/${orgSlug}/boards`);
}

export async function archiveBoard(boardId: string, orgSlug: string) {
  const { user, org } = await validateOrgAccess(orgSlug, "member");

  await connectDB();
  const board = await Board.findOneAndUpdate(
    { _id: boardId, organizationId: org._id },
    { archived: true },
    { new: true }
  );

  if (!board) throw new Error("Board not found");

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "BOARD_ARCHIVED",
    message: `archived board "${board.name}"`,
  });

  revalidatePath(`/${orgSlug}/boards`);
}