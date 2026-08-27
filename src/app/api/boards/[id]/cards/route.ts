import { Prisma } from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { createCardApiSchema, updateCardsPatchSchema } from "@/lib/validations";
import { Board, Role } from "@/types";
import { updateTag } from "next/cache";
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

function invalidateBoardCache(board: Pick<Board, "id" | "organizationId">) {
  updateTag(`board-${board.id}`);
  updateTag(`org-${board.organizationId}-boards`);
}

async function checkBoardAccess(
  boardId: string,
  minRole: Role,
): Promise<{
  userId: string;
  board: Pick<Board, "id" | "organizationId" | "name">;
}> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, organizationId: true, name: true },
  });
  if (!board) throw new Error("Board not found");

  await requireRole(session.user.id, board.organizationId, minRole);
  return { userId: session.user.id, board };
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

function sqlWhenThen(ids: string[], value: string | number) {
  return Prisma.join(
    ids.map((id) => Prisma.sql`WHEN ${id} THEN ${value}`),
    " ",
  );
}

function sqlPositionCases(ids: string[]) {
  return Prisma.join(
    ids.map((id, idx) => Prisma.sql`WHEN ${id} THEN ${(idx + 1) * 1000}`),
    " ",
  );
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

    const maxPositionCard = await prisma.card.findFirst({
      where: { listId: parsed.listId },
      orderBy: { position: "desc" },
    });
    const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

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

    // 1) Move across lists — one UPDATE
    if (
      payload.cardId &&
      payload.targetListId &&
      payload.sourceListId &&
      Array.isArray(payload.targetCardIds) &&
      Array.isArray(payload.sourceCardIds)
    ) {
      const listsOk = await assertListsOnBoard(board.id, [
        payload.sourceListId,
        payload.targetListId,
      ]);
      if (!listsOk) return jsonError("Invalid list for this board", 400);

      const allIds = [
        ...new Set([...payload.targetCardIds, ...payload.sourceCardIds]),
      ];
      if (!(await assertCardsOnBoard(board.id, allIds))) {
        return jsonError("Invalid cards for this board", 400);
      }

      const listIdCases: Prisma.Sql[] = [];
      if (payload.targetCardIds.length > 0) {
        listIdCases.push(
          sqlWhenThen(payload.targetCardIds, payload.targetListId),
        );
      }
      if (payload.sourceCardIds.length > 0) {
        listIdCases.push(
          sqlWhenThen(payload.sourceCardIds, payload.sourceListId),
        );
      }

      const positionCases: Prisma.Sql[] = [];
      if (payload.targetCardIds.length > 0) {
        positionCases.push(sqlPositionCases(payload.targetCardIds));
      }
      if (payload.sourceCardIds.length > 0) {
        positionCases.push(sqlPositionCases(payload.sourceCardIds));
      }

      if (listIdCases.length > 0 && positionCases.length > 0) {
        await prisma.$executeRaw`
          UPDATE "card"
          SET
            "listId" = CASE "id" ${Prisma.join(listIdCases, " ")} ELSE "listId" END,
            "position" = CASE "id" ${Prisma.join(positionCases, " ")} ELSE "position" END
          WHERE "id" IN (${Prisma.join(allIds)})
        `;
      }

      await logActivity({
        organizationId: board.organizationId,
        boardId: board.id,
        cardId: payload.cardId,
        actorId: userId,
        type: "CARD_MOVED",
        message: "moved card to another list",
      });

      invalidateBoardCache(board);
      return NextResponse.json({ success: true });
    }

    // 2) Reorder inside one list — one UPDATE
    if (
      Array.isArray(payload.cardIds) &&
      payload.cardIds.length > 0 &&
      payload.listId &&
      !payload.cardId
    ) {
      const listOk = await assertListsOnBoard(board.id, [payload.listId]);
      if (!listOk) return jsonError("Invalid list for this board", 400);

      if (!(await assertCardsOnBoard(board.id, payload.cardIds))) {
        return jsonError("Invalid cards for this board", 400);
      }

      await prisma.$executeRaw`
        UPDATE "card"
        SET "position" = CASE "id" ${sqlPositionCases(payload.cardIds)} ELSE "position" END
        WHERE "id" IN (${Prisma.join(payload.cardIds)})
          AND "listId" = ${payload.listId}
      `;

      invalidateBoardCache(board);
      return NextResponse.json({ success: true });
    }

    // 3) Single card details — scoped to this board
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
