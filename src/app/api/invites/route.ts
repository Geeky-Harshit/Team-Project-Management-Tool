import { logActivity } from "@/lib/activity-logger";
import { getSession } from "@/lib/auth/auth";
import { requireRole } from "@/lib/auth/permissions";
import connectDB from "@/lib/db";
import { sendInviteEmail } from "@/lib/mailer";
import Invite from "@/models/organization/Invite";
import Organization from "@/models/organization/Organization";
import OrganizationMember from "@/models/organization/OrganizationMember";
import { Role } from "@/types";
import crypto from "crypto";
import mongoose from "mongoose";
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const normalizedEmail = email.trim().toLowerCase();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not ready" },
        { status: 500 },
      );
    }

    const existingUser = await db
      .collection("user")
      .findOne({ email: normalizedEmail }, { projection: { _id: 1 } });

    if (existingUser?._id) {
      const existingMember = await OrganizationMember.findOne({
        organizationId,
        userId: existingUser._id,
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

    const activeInvite = await Invite.findOne({
      organizationId,
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { $gt: new Date() },
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

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const invite = await Invite.create({
      organizationId,
      email: normalizedEmail,
      token,
      role: role || "member",
      invitedBy: session.user.id,
      expiresAt,
    });

    await logActivity({
      organizationId,
      actorId: session.user.id,
      type: "MEMBER_INVITED",
      message: "invited " + normalizedEmail + " as " + (role || "member"),
    });

    const org = await Organization.findById(organizationId).select("name");
    const joinUrl = request.nextUrl.origin + "/invite?token=" + token;

    try {
      await sendInviteEmail({
        to: normalizedEmail,
        orgName: org?.name || "Unknown Organization",
        role: role || "member",
        joinUrl,
        inviterName: session.user.name || session.user.email,
      });
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
    }

    return NextResponse.json({ invite, joinUrl }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err) {
      const code = (err as { code?: unknown }).code;
      if (code === 11000) {
        return NextResponse.json(
          {
            error:
              "An active invite for this email already exists in this organization.",
          },
          { status: 409 },
        );
      }
    }

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

    const { organizationId, token } = (await request.json()) as {
      organizationId?: string;
      token?: string;
    };

    if (!organizationId || !token) {
      return NextResponse.json(
        { error: "organizationId and token required" },
        { status: 400 },
      );
    }

    await connectDB();
    await requireRole(session.user.id, organizationId, "admin");

    const invite = await Invite.findOne({
      organizationId,
      token,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Pending invite not found" },
        { status: 404 },
      );
    }

    await Invite.deleteOne({ _id: invite._id });

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
