import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import {
  createCardApiSchema,
  updateCardsPatchSchema,
} from "@/lib/validations";
import { Role } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface BoardDoc {
  id: string;
  organizationId: string;
  name: string;
}

async function checkBoardAccess(
  boardId: string,
  minRole: Role,
): Promise<{ userId: string; board: BoardDoc }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });
  if (!board) throw new Error("Board not found");

  await requireRole(session.user.id, board.organizationId, minRole);
  return { userId: session.user.id, board };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { board } = await checkBoardAccess(id, "viewer");

    const lists = await prisma.list.findMany({
      where: { boardId: board.id, archived: false },
      select: { id: true },
    });

    const listIds = lists.map((l) => l.id);

    const cards = await prisma.card.findMany({
      where: { listId: { in: listIds }, archived: false },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(cards);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
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
    if (!list)
      return NextResponse.json(
        { error: "Invalid list for this board" },
        { status: 400 },
      );

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

    return NextResponse.json(card, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
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

    // 1) Move card across lists + update orders in both lists inside an atomic SQL transaction
    if (
      payload.cardId &&
      payload.targetListId &&
      payload.sourceListId &&
      Array.isArray(payload.targetCardIds) &&
      Array.isArray(payload.sourceCardIds)
    ) {
      await prisma.$transaction([
        prisma.card.update({
          where: { id: payload.cardId },
          data: { listId: payload.targetListId },
        }),
        ...payload.targetCardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId },
            data: { listId: payload.targetListId, position: (idx + 1) * 1000 },
          }),
        ),
        ...payload.sourceCardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId },
            data: { listId: payload.sourceListId, position: (idx + 1) * 1000 },
          }),
        ),
      ]);

      await logActivity({
        organizationId: board.organizationId,
        boardId: board.id,
        cardId: payload.cardId,
        actorId: userId,
        type: "CARD_MOVED",
        message: "moved card to another list",
      });

      return NextResponse.json({ success: true });
    }

    // 2) Bulk reorder inside one list
    if (
      Array.isArray(payload.cardIds) &&
      payload.cardIds.length > 0 &&
      payload.listId &&
      !payload.cardId
    ) {
      await prisma.$transaction(
        payload.cardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId, listId: payload.listId },
            data: { position: (idx + 1) * 1000 },
          }),
        ),
      );

      return NextResponse.json({ success: true });
    }

    // 3) Single card details update
    if (payload.cardId) {
      const updates: {
        title?: string;
        description?: string;
        assigneeId?: string | null;
        dueDate?: Date | null;
      } = {};

      if (payload.title !== undefined) updates.title = payload.title;
      if (payload.description !== undefined) updates.description = payload.description;
      if (payload.assigneeId !== undefined) updates.assigneeId = payload.assigneeId;
      if (payload.dueDate !== undefined)
        updates.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;

      const updatedCard = await prisma.card.update({
        where: { id: payload.cardId },
        data: updates,
      });

      return NextResponse.json(updatedCard);
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
