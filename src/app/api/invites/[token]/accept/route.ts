import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { prisma } from "@/lib/prisma";
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

    const invite = await prisma.invitation.findFirst({
      where: { id: token, status: "pending" },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    if (normalizeEmail(session.user.email) !== normalizeEmail(invite.email)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.member.create({
        data: {
          organizationId: invite.organizationId,
          userId: session.user.id,
          role: invite.role || "member",
        },
      }),
      prisma.invitation.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      }),
    ]);

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
