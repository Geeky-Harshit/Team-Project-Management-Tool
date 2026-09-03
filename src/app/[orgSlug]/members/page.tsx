// src/app/[orgSlug]/members/page.tsx

import { MembersPageFallback } from "@/components/fallbacks/members/members-page-fallback";
import MembersClient from "@/components/members/members-client";
import { canManageOrg } from "@/lib/auth/permissions";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Invite, MemberWithUser, Role } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

async function MembersPageInner({
  orgId,
  currentUserId,
  isAdmin,
}: {
  orgId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  // Heavy DB queries run while Suspense shows the role-specific skeleton
  const [dbMembers, dbInvites] = await Promise.all([
    prisma.member.findMany({
      where: { organizationId: orgId },
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
          organizationId: orgId,
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
      orgId={orgId}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
      initialMembers={initialMembers}
      initialInvites={initialInvites}
    />
  );
}

export default async function MembersPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  // Fast permission check (~1-3ms)
  const { user, role } = await validateOrgAccess(org.id, "viewer", org);
  const isAdmin = canManageOrg(role);

  return (
    <Suspense fallback={<MembersPageFallback isAdmin={isAdmin} />}>
      <MembersPageInner
        orgId={org.id}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </Suspense>
  );
}