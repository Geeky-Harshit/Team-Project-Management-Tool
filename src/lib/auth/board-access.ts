import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { Role } from "@/types";

export async function validateBoardAccess(
  boardId: string,
  minRole: Role = "viewer"
) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      organizationId: true,
      name: true,
      archived: true,
    },
  });

  if (!board || board.archived) {
    throw new Error("Board not found");
  }

  const role = await requireRole(session.user.id, board.organizationId, minRole);

  return {
    user: session.user,
    board,
    role,
  };
}
