import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
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
    const { title, listId } = (await request.json()) as {
      title?: string;
      listId?: string;
    };

    if (!title || !listId) {
      return NextResponse.json(
        { error: "Title and listId required" },
        { status: 400 },
      );
    }

    const list = await prisma.list.findFirst({
      where: { id: listId, boardId: board.id },
    });
    if (!list)
      return NextResponse.json(
        { error: "Invalid list for this board" },
        { status: 400 },
      );

    const maxPositionCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: "desc" },
    });
    const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

    const card = await prisma.card.create({
      data: {
        title,
        listId,
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
      message: `created card "${title}" via API`,
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

    const body = (await request.json()) as {
      cardId?: string;
      targetListId?: string;
      targetCardIds?: string[];
      sourceListId?: string;
      sourceCardIds?: string[];
      cardIds?: string[];
      listId?: string;
      title?: string;
      description?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
    };

    // 1) Move card across lists + update orders in both lists inside an atomic SQL transaction
    if (
      body.cardId &&
      body.targetListId &&
      body.sourceListId &&
      Array.isArray(body.targetCardIds) &&
      Array.isArray(body.sourceCardIds)
    ) {
      await prisma.$transaction([
        prisma.card.update({
          where: { id: body.cardId },
          data: { listId: body.targetListId },
        }),
        ...body.targetCardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId },
            data: { listId: body.targetListId, position: (idx + 1) * 1000 },
          }),
        ),
        ...body.sourceCardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId },
            data: { listId: body.sourceListId, position: (idx + 1) * 1000 },
          }),
        ),
      ]);

      await logActivity({
        organizationId: board.organizationId,
        boardId: board.id,
        cardId: body.cardId,
        actorId: userId,
        type: "CARD_MOVED",
        message: "moved card to another list",
      });

      return NextResponse.json({ success: true });
    }

    // 2) Bulk reorder inside one list
    if (
      Array.isArray(body.cardIds) &&
      body.cardIds.length > 0 &&
      body.listId &&
      !body.cardId
    ) {
      await prisma.$transaction(
        body.cardIds.map((cardId, idx) =>
          prisma.card.update({
            where: { id: cardId, listId: body.listId },
            data: { position: (idx + 1) * 1000 },
          }),
        ),
      );

      return NextResponse.json({ success: true });
    }

    // 3) Single card details update
    if (body.cardId) {
      const updates: Record<string, unknown> = {};
      if (typeof body.title === "string") updates.title = body.title;
      if (typeof body.description === "string") updates.description = body.description;
      if ("assigneeId" in body) updates.assigneeId = body.assigneeId ?? null;
      if ("dueDate" in body) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;

      const updatedCard = await prisma.card.update({
        where: { id: body.cardId },
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
