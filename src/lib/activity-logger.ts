import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/types";

interface LogParams {
  organizationId: string;
  boardId?: string | null;
  cardId?: string | null;
  actorId: string;
  type: ActivityType;
  message: string;
}

export async function logActivity(params: LogParams) {
  return await prisma.activity.create({
    data: {
      organizationId: params.organizationId,
      boardId: params.boardId || null,
      cardId: params.cardId || null,
      actorId: params.actorId,
      type: params.type,
      message: params.message,
    },
  });
}
