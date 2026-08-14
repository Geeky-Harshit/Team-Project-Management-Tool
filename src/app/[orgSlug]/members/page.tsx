import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";
import OrganizationMember from "@/models/organization/OrganizationMember";
import { redirect, notFound } from "next/navigation";
import MembersClient from "@/components/members/members-client";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function MembersPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session) redirect("/sign-in");

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) notFound();

  const membership = await OrganizationMember.findOne({
    organizationId: org._id,
    userId: session.user.id,
  });

  if (!membership) redirect("/dashboard");

  const isAdmin = membership.role === "admin" || membership.role === "owner";

  return (
    <MembersClient
      orgId={org._id.toString()}
      isAdmin={isAdmin}
      currentUserId={session.user.id}
    />
  );
}