import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import Organization from "@/models/organization/Organization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const org = await Organization.findOne({ slug });
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org._id.toString(), "viewer");

    const boards = await Board.find({
      organizationId: org._id,
      archived: false,
    }).sort({ createdAt: -1 });
    return NextResponse.json(boards);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong while getting boards" },
        { status: 400 },
      );
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (!name)
      return NextResponse.json({ error: "Name required" }, { status: 400 });

    await connectDB();
    const org = await Organization.findOne({ slug });
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org._id.toString(), "member");

    const board = await Board.create({
      name,
      organizationId: org._id,
      createdBy: session.user.id,
    });

    await logActivity({
      organizationId: org._id,
      boardId: board._id,
      actorId: session.user.id,
      type: "BOARD_CREATED",
      message: `created board "${name}" via API`,
    });

    return NextResponse.json(board, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong while creating board" },
        { status: 400 },
      );
    }
  }
}
