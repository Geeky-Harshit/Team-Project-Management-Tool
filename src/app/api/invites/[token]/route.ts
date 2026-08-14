import connectDB from "@/lib/db";
import Invite from "@/models/organization/Invite";
import Organization from "@/models/organization/Organization";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    await connectDB();
    const invite = await Invite.findOne({ token, usedAt: null });

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

    const org = await Organization.findById(invite.organizationId).select(
      "name slug",
    );
    return NextResponse.json({
      invite,
      organization: org ? { name: org.name, slug: org.slug } : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
