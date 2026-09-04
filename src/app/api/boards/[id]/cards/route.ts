import { logActivity } from "@/lib/activity-logger";
import { validateBoardAccess } from "@/lib/auth/board-access";
import { generateKeyBetween } from "@/lib/lexicographic-position";
import { prisma } from "@/lib/prisma";
import { createCardApiSchema, updateCardsPatchSchema } from "@/lib/validations";
import { Board, Role } from "@/types";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function routeError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(err.issues[0]?.message ?? "Invalid request", 400);
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  if (message === "Unauthorized") return jsonError(message, 401);
  if (
    message === "Insufficient permissions" ||
    message === "Not a member of this organization"
  ) {
    return jsonError(message, 403);
  }
  if (message.toLowerCase().includes("not found")) {
    return jsonError(message, 404);
  }
  return jsonError(message, 400);
}

// updateTag throws outside Server Actions, so route handlers must use
// revalidateTag. The zero profile makes it an immediate hard invalidation
// instead of a stale-while-revalidate window.
const IMMEDIATE = { stale: 0, revalidate: 0, expire: 0 };

function invalidateBoardCache(board: Pick<Board, "id" | "organizationId">) {
  revalidateTag(`board-${board.id}`, IMMEDIATE);
  revalidateTag(`org-${board.organizationId}-boards`, IMMEDIATE);
}

async function checkBoardAccess(
  boardId: string,
  minRole: Role,
): Promise<{
  userId: string;
  board: Pick<Board, "id" | "organizationId" | "name">;
}> {
  const { user, board } = await validateBoardAccess(boardId, minRole);
  return {
    userId: user.id,
    board: {
      id: board.id,
      organizationId: board.organizationId,
      name: board.name,
    },
  };
}

async function assertListsOnBoard(boardId: string, listIds: string[]) {
  const unique = [...new Set(listIds)];
  const count = await prisma.list.count({
    where: { boardId, id: { in: unique } },
  });
  return count === unique.length;
}

async function assertCardsOnBoard(boardId: string, cardIds: string[]) {
  const unique = [...new Set(cardIds)];
  if (unique.length === 0) return false;
  const count = await prisma.card.count({
    where: { id: { in: unique }, list: { boardId } },
  });
  return count === unique.length;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { board } = await checkBoardAccess(id, "viewer");

    const cards = await prisma.card.findMany({
      where: {
        archived: false,
        list: { boardId: board.id, archived: false },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(cards);
  } catch (err: unknown) {
    return routeError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId, board } = await checkBoardAccess(id, "member");

    const body = await request.json();
    const parsed = createCardApiSchema.parse(body);

    const list = await prisma.list.findFirst({
      where: { id: parsed.listId, boardId: board.id },
    });
    if (!list) return jsonError("Invalid list for this board", 400);

    const lastCard = await prisma.card.findFirst({
      where: { listId: parsed.listId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = generateKeyBetween(lastCard?.position ?? null, null);

    const card = await prisma.card.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        assigneeId: parsed.assigneeId,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        listId: parsed.listId,
        position,
        createdBy: userId,
      },
    });

    await logActivity({
      organizationId: board.organizationId,
      boardId: board.id,
      cardId: card.id,
      actorId: userId,
      type: "CARD_CREATED",
      message: `created card "${parsed.title}" via API`,
    });

    invalidateBoardCache(board);
    return NextResponse.json(card, { status: 201 });
  } catch (err: unknown) {
    return routeError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId, board } = await checkBoardAccess(id, "member");

    const body = await request.json();
    const payload = updateCardsPatchSchema.parse(body);

    // 1) Move or reorder — update only the dragged card
    if (payload.cardId && payload.listId && payload.position) {
      const listOk = await assertListsOnBoard(board.id, [payload.listId]);
      if (!listOk) return jsonError("Invalid list for this board", 400);

      if (!(await assertCardsOnBoard(board.id, [payload.cardId]))) {
        return jsonError("Invalid cards for this board", 400);
      }

      const existing = await prisma.card.findUnique({
        where: { id: payload.cardId },
        select: { listId: true },
      });
      if (!existing) return jsonError("Card not found", 404);

      await prisma.card.update({
        where: { id: payload.cardId },
        data: {
          listId: payload.listId,
          position: payload.position,
        },
      });

      if (existing.listId !== payload.listId) {
        await logActivity({
          organizationId: board.organizationId,
          boardId: board.id,
          cardId: payload.cardId,
          actorId: userId,
          type: "CARD_MOVED",
          message: "moved card to another list",
        });
      }

      invalidateBoardCache(board);
      return NextResponse.json({ success: true });
    }

    // 2) Single card details — scoped to this board
    if (payload.cardId) {
      const updates: {
        title?: string;
        description?: string;
        assigneeId?: string | null;
        dueDate?: Date | null;
      } = {};

      if (payload.title !== undefined) updates.title = payload.title;
      if (payload.description !== undefined)
        updates.description = payload.description;
      if (payload.assigneeId !== undefined)
        updates.assigneeId = payload.assigneeId;
      if (payload.dueDate !== undefined)
        updates.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;

      const result = await prisma.card.updateMany({
        where: {
          id: payload.cardId,
          list: { boardId: board.id },
        },
        data: updates,
      });
      if (result.count === 0) return jsonError("Card not found", 404);

      const updatedCard = await prisma.card.findUnique({
        where: { id: payload.cardId },
      });

      invalidateBoardCache(board);
      return NextResponse.json(updatedCard);
    }

    return jsonError("Invalid request payload", 400);
  } catch (err: unknown) {
    return routeError(err);
  }
}
