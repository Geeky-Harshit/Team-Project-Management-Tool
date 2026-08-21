import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Math.max(1, Number(searchParams.get("limit")) || 20),
      100
    );

    if (!orgId)
      return NextResponse.json({ error: "orgId required" }, { status: 400 });

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org.id, "viewer");

    const where: { organizationId: string; createdAt?: { lt: Date } } = {
      organizationId: org.id,
    };

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const activities = await prisma.activity.findMany({
      where,
      take: limit + 1, // Fetch 1 extra to check if there is a next page
      orderBy: { createdAt: "desc" },
    });

    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    return NextResponse.json({
      activities: items.map((a) => ({
        id: a.id,
        organizationId: a.organizationId,
        boardId: a.boardId,
        cardId: a.cardId,
        actorId: a.actorId,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
