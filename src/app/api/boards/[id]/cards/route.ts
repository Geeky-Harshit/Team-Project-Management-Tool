import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import Card from "@/models/card/Card";
import { Role } from "@/types";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface BoardDoc {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
}

async function checkBoardAccess(
  boardId: string,
  minRole: Role,
): Promise<{ userId: string; board: BoardDoc }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await connectDB();
  const board = await Board.findById(boardId);
  if (!board) throw new Error("Board not found");

  await requireRole(session.user.id, board.organizationId.toString(), minRole);
  return { userId: session.user.id, board: board as BoardDoc };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { board } = await checkBoardAccess(id, "viewer");
    const lists = await List.find({
      boardId: board._id,
      archived: false,
    }).select("_id");
    const cards = await Card.find({
      listId: { $in: lists.map((l) => l._id) },
      archived: false,
    }).sort({ position: 1 });

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

    const list = await List.findOne({ _id: listId, boardId: board._id });
    if (!list)
      return NextResponse.json(
        { error: "Invalid list for this board" },
        { status: 400 },
      );

    const maxPositionCard = await Card.findOne({ listId }).sort({
      position: -1,
    });
    const position = maxPositionCard ? maxPositionCard.position + 1000 : 1000;

    const card = await Card.create({
      title,
      listId,
      position,
      createdBy: userId,
    });

    await logActivity({
      organizationId: board.organizationId,
      boardId: board._id,
      cardId: card._id,
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
      cardIds?: string[];
      listId?: string;
      cardId?: string;
      title?: string;
      description?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
    };

    // Bulk drag-and-drop reorder
    if (body.cardIds && body.listId) {
      const list = await List.findOne({ _id: body.listId, boardId: board._id });
      if (!list)
        return NextResponse.json({ error: "Invalid list" }, { status: 400 });

      const bulkOps = body.cardIds.map((cardId, idx) => ({
        updateOne: {
          filter: { _id: cardId, listId: body.listId },
          update: { position: (idx + 1) * 1000 },
        },
      }));

      await Card.bulkWrite(bulkOps);

      await logActivity({
        organizationId: board.organizationId,
        boardId: board._id,
        actorId: userId,
        type: "CARD_MOVED",
        message: `reordered cards in list "${list.name}"`,
      });

      return NextResponse.json({ success: true });
    }

    // Single card update
    if (body.cardId) {
      const { cardId, ...updates } = body;
      const card = await Card.findOneAndUpdate({ _id: cardId }, updates, {
        new: true,
      });
      if (!card)
        return NextResponse.json({ error: "Card not found" }, { status: 404 });

      await logActivity({
        organizationId: board.organizationId,
        boardId: board._id,
        cardId: card._id,
        actorId: userId,
        type: "CARD_UPDATED",
        message: `updated card via API`,
      });

      return NextResponse.json(card);
    }

    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
