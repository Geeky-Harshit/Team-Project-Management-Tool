"use server";

import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import { revalidatePath } from "next/cache";

export async function createBoard(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!name || !organizationId) {
    throw new Error("Missing required fields");
  }

  await connectDB();
  await Board.create({
    name,
    organizationId,
    createdBy: session.user.id,
  });

  const orgSlug = formData.get("orgSlug") as string;
  revalidatePath(`/${orgSlug}/boards`);
}
