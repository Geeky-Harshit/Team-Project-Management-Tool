"use server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import List from "@/models/board/List";
import { revalidatePath } from "next/cache";

export async function createList(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const boardId = formData.get("boardId") as string;
  const orgSlug = formData.get("orgSlug") as string;

  if (!name || !boardId || !orgSlug) {
    throw new Error("Missing required fields");
  }

  await connectDB();

  // Find max position to append list to the end
  const maxPositionList = await List.findOne({ boardId }).sort({ position: -1 });
  const position = maxPositionList ? maxPositionList.position + 1 : 1;

  await List.create({
    name,
    boardId,
    position,
  });

  revalidatePath(`/${orgSlug}/board/${boardId}`);
}
