import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import Invite from "@/models/organization/Invite";
import { Role } from "@/types";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = request.nextUrl.searchParams.get("organizationId");
    if (!organizationId)
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );

    await connectDB();
    await requireRole(session.user.id, organizationId, "member");

    const invites = await Invite.find({
      organizationId,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json(invites);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { organizationId, email, role } = (await request.json()) as {
      organizationId?: string;
      email?: string;
      role?: Role;
    };
    if (!organizationId || !email) {
      return NextResponse.json(
        { error: "organizationId and email required" },
        { status: 400 },
      );
    }

    await connectDB();
    await requireRole(session.user.id, organizationId, "admin");

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await Invite.create({
      organizationId,
      email,
      token,
      role: role || "member",
      invitedBy: session.user.id,
      expiresAt,
    });

    await logActivity({
      organizationId,
      actorId: session.user.id,
      type: "MEMBER_INVITED",
      message: `invited ${email} as ${role || "member"}`,
    });

    const joinUrl = `${request.nextUrl.origin}/invite?token=${token}`;
    return NextResponse.json({ invite, joinUrl }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
