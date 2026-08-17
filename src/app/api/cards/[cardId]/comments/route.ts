import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import Card from "@/models/card/Card";
import Comment from "@/models/card/Comment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId } = await params;

    await connectDB();

    const card = await Card.findById(cardId).select("_id listId");
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const list = await List.findById(card.listId).select("_id boardId");
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const board = await Board.findById(list.boardId).select(
      "_id organizationId",
    );
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    await requireRole(
      session.user.id,
      board.organizationId.toString(),
      "viewer",
    );

    const comments = await Comment.find({ cardId: card._id }).sort({
      createdAt: 1,
    });

    return NextResponse.json(
      comments.map((c) => ({
        id: c._id.toString(),
        cardId: c.cardId.toString(),
        authorId: c.authorId,
        content: c.content,
        parentId: c.parentId ? c.parentId.toString() : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
