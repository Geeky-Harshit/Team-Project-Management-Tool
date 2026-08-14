import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Invite from "@/models/organization/Invite";
import OrganizationMember from "@/models/organization/OrganizationMember";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await params;
    await connectDB();
    const invite = await Invite.findOne({ token, usedAt: null });

    if (!invite || new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    await OrganizationMember.create({
      organizationId: invite.organizationId,
      userId: session.user.id,
      role: invite.role,
    });

    invite.usedAt = new Date();
    await invite.save();

    await logActivity({
      organizationId: invite.organizationId,
      actorId: session.user.id,
      type: "MEMBER_JOINED",
      message: `joined the organization via invite link`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
