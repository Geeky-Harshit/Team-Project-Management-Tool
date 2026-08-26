import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { createOrgBoardApiSchema } from "@/lib/validations";
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

    const org = await prisma.organization.findUnique({
      where: { slug },
    });
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org.id, "viewer");

    const boards = await prisma.board.findMany({
      where: {
        organizationId: org.id,
        archived: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong while getting boards";
    return NextResponse.json({ error: message }, { status: 400 });
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

    const body = await request.json();
    const { name } = createOrgBoardApiSchema.parse(body);

    const org = await prisma.organization.findUnique({
      where: { slug },
    });
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org.id, "member");

    const board = await prisma.board.create({
      data: {
        name,
        organizationId: org.id,
      },
    });

    await logActivity({
      organizationId: org.id,
      boardId: board.id,
      actorId: session.user.id,
      type: "BOARD_CREATED",
      message: `created board "${name}" via API`,
    });

    return NextResponse.json(board, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (
      message === "Insufficient permissions" ||
      message === "Not a member of this organization"
    ) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.toLowerCase().includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
