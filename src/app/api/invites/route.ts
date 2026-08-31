import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { requireRole } from "@/lib/auth/permissions";
import { sendInviteEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createInviteSchema, deleteInviteSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = request.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId required" },
        { status: 400 },
      );
    }

    await requireRole(session.user.id, organizationId, "member");

    const invites = await prisma.invitation.findMany({
      where: {
        organizationId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, email, role } = createInviteSchema.parse(body);

    await requireRole(session.user.id, organizationId, "admin");

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      const existingMember = await prisma.member.findFirst({
        where: {
          organizationId,
          userId: existingUser.id,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          {
            error:
              "A user with this email is already a member of this organization.",
          },
          { status: 409 },
        );
      }
    }

    const activeInvite = await prisma.invitation.findFirst({
      where: {
        organizationId,
        email: normalizedEmail,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
    });

    if (activeInvite) {
      return NextResponse.json(
        {
          error:
            "An active invite for this email already exists in this organization.",
        },
        { status: 409 },
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const invite = await prisma.invitation.create({
      data: {
        organizationId,
        email: normalizedEmail,
        role,
        status: "pending",
        inviterId: session.user.id,
        expiresAt,
      },
    });

    await logActivity({
      organizationId,
      actorId: session.user.id,
      type: "MEMBER_INVITED",
      message: `invited ${normalizedEmail} as ${role}`,
    });

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    const joinUrl = `${request.nextUrl.origin}/invite?token=${invite.id}`;

    try {
      await sendInviteEmail({
        to: normalizedEmail,
        orgName: org?.name || "Unknown Organization",
        role,
        joinUrl,
        inviterName: session.user.name || session.user.email,
      });
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
    }

    return NextResponse.json({ invite, joinUrl }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, token } = deleteInviteSchema.parse(body);

    await requireRole(session.user.id, organizationId, "admin");

    const invite = await prisma.invitation.findFirst({
      where: {
        id: token,
        organizationId,
        status: "pending",
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Pending invite not found" },
        { status: 404 },
      );
    }

    await prisma.invitation.delete({
      where: { id: invite.id },
    });

    await logActivity({
      organizationId,
      actorId: session.user.id,
      type: "MEMBER_INVITED",
      message: `removed pending invite for ${invite.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
