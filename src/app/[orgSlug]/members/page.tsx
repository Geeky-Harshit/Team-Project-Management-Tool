import MembersClient from "@/components/members/members-client";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

export default async function MembersPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  const { user, role } = await validateOrgAccess(org.id, "viewer", org);
  const isAdmin = role === "admin" || role === "owner";

  return (
    <MembersClient
      orgId={org.id}
      isAdmin={isAdmin}
      currentUserId={user.id}
    />
  );
}
