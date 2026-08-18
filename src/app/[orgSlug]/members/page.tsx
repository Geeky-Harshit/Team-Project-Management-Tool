import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import MembersClient from "@/components/members/members-client";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function MembersPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session) redirect("/sign-in");

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  const membership = await prisma.member.findFirst({
    where: {
      organizationId: org.id,
      userId: session.user.id,
    },
  });

  if (!membership) redirect("/dashboard");

  const isAdmin = membership.role === "admin" || membership.role === "owner";

  return (
    <MembersClient
      orgId={org.id}
      isAdmin={isAdmin}
      currentUserId={session.user.id}
    />
  );
}
