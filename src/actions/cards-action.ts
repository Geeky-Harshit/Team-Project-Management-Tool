"use server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Card from "@/models/card/Card";
import { revalidatePath } from "next/cache";

export async function createCard(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const listId = formData.get("listId") as string;
  const boardId = formData.get("boardId") as string;
  const orgSlug = formData.get("orgSlug") as string;

  if (!title || !listId || !boardId || !orgSlug) {
    throw new Error("Missing required fields");
  }

  await connectDB();

  // Find max position to append card to the end of column
  const maxPositionCard = await Card.findOne({ listId }).sort({ position: -1 });
  const position = maxPositionCard ? maxPositionCard.position + 1 : 1;

  await Card.create({
    title,
    listId,
    position,
    createdBy: session.user.id,
  });

  revalidatePath(`/${orgSlug}/board/${boardId}`);
}
