import { getCachedOrgBySlug } from "@/lib/data-cache";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import MembersClient from "@/components/members/members-client";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
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
