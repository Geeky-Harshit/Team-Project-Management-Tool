import MembersClient from "@/components/members/members-client";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Invite, MemberWithUser, Role } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MembersLoading from "./loading";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Members Not Found" };

  return {
    title: `${org.name} | Members & Permissions`,
    description: `Manage team members, roles, and invitations for ${org.name}.`,
  };
}

async function MembersPageInner({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  const { user, role } = await validateOrgAccess(org.id, "viewer", org);
  const isAdmin = role === "admin" || role === "owner";

  const [dbMembers, dbInvites] = await Promise.all([
    prisma.member.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    isAdmin
      ? prisma.invitation.findMany({
          where: {
            organizationId: org.id,
            status: "pending",
          },
          orderBy: { expiresAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const initialMembers: MemberWithUser[] = dbMembers.map((m) => ({
    id: m.id,
    role: m.role as Role,
    createdAt: m.createdAt.toISOString(),
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    },
  }));

  const initialInvites: Invite[] = dbInvites.map((inv) => ({
    id: inv.id,
    organizationId: inv.organizationId,
    email: inv.email,
    role: inv.role as Role,
    invitedBy: inv.inviterId,
    status: inv.status,
    expiresAt: inv.expiresAt.toISOString(),
  }));

  return (
    <MembersClient
      orgId={org.id}
      isAdmin={isAdmin}
      currentUserId={user.id}
      initialMembers={initialMembers}
      initialInvites={initialInvites}
    />
  );
}

export default function MembersPage({ params }: PageProps) {
  return (
    <Suspense fallback={<MembersLoading />}>
      <MembersPageInner params={params} />
    </Suspense>
  );
}
