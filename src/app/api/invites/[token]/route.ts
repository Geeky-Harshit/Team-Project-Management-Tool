import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const invite = await prisma.invitation.findFirst({
      where: { id: token, status: "pending" },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or already used invite token" },
        { status: 404 },
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite token has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      invite,
      organization: invite.organization
        ? { name: invite.organization.name, slug: invite.organization.slug }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
