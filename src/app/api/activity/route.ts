import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import Activity from "@/models/activity/Activity";
import Organization from "@/models/organization/Organization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId");
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!orgId)
      return NextResponse.json({ error: "orgId required" }, { status: 400 });

    await connectDB();
    const org = await Organization.findById(orgId);
    if (!org)
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );

    await requireRole(session.user.id, org._id.toString(), "viewer");

    const query: Record<string, unknown> = { organizationId: org._id };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasNextPage = activities.length > limit;
    const items = hasNextPage ? activities.slice(0, limit) : activities;
    const nextCursor = hasNextPage
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      activities: items,
      nextCursor,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
