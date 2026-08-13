"use server";

import { logActivity } from "@/lib/activity-logger";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import { revalidatePath } from "next/cache";

export async function createList(formData: FormData) {
  const name = formData.get("name") as string;
  const boardId = formData.get("boardId") as string;
  const orgId = formData.get("orgId") as string;

  const { user, org } = await validateOrgAccess(orgId, "member");

  await connectDB();
  const board = await Board.findOne({ _id: boardId, organizationId: org._id });
  if (!board) throw new Error("Board access denied");

  const maxPositionList = await List.findOne({ boardId }).sort({ position: -1 });
  const position = maxPositionList ? maxPositionList.position + 1000 : 1000;

  const list = await List.create({
    name,
    boardId,
    position,
  });

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "LIST_CREATED",
    message: `created list "${name}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.orgSlug}/boards/${boardId}`);
}

export async function renameList(listId: string, boardId: string, orgId: string, newName: string) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  await connectDB();
  const board = await Board.findOne({ _id: boardId, organizationId: org._id });
  if (!board) throw new Error("Board access denied");

  const list = await List.findOneAndUpdate(
    { _id: listId, boardId },
    { name: newName },
    { new: true }
  );

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "LIST_RENAMED",
    message: `renamed list to "${newName}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.orgSlug}/boards/${boardId}`);
}

export async function deleteList(listId: string, boardId: string, orgId: string) {
  const { user, org } = await validateOrgAccess(orgId, "member");

  await connectDB();
  const board = await Board.findOne({ _id: boardId, organizationId: org._id });
  if (!board) throw new Error("Board access denied");

  const list = await List.findOneAndDelete({ _id: listId, boardId });
  if (!list) throw new Error("List not found");

  await logActivity({
    organizationId: org._id,
    boardId: board._id,
    actorId: user.id,
    type: "LIST_DELETED",
    message: `deleted list "${list.name}" on board "${board.name}"`,
  });

  revalidatePath(`/${org.orgSlug}/boards/${boardId}`);
}