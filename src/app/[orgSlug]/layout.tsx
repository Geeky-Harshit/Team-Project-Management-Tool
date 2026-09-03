import { OrgLayoutFallback } from "@/components/fallbacks/layout/org-layout-fallback";
import Sidebar from "@/components/sidebar";
import { OrgProvider } from "@/context/org-context";
import { getSession } from "@/lib/auth/auth";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Organization } from "@/types";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrgNotFoundPage from "./not-found";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

async function OrgLayoutInner({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const org = await getCachedOrgBySlug(orgSlug);

  if (!org) {
    return <OrgNotFoundPage />;
  }

  const memberships = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  if (!memberships.some((m) => m.organizationId === org.id)) {
    redirect("/dashboard");
  }

  const initialOrgs: Organization[] = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    logo: m.organization.logo,
    metadata: m.organization.metadata,
    createdAt: m.organization.createdAt.toISOString(),
  }));

  return (
    <OrgProvider
      userId={session.user.id}
      initialOrgs={initialOrgs}
      initialCurrentOrg={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt.toISOString(),
      }}
    >
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden relative">
        <Sidebar orgName={org.name} orgSlug={orgSlug} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </OrgProvider>
  );
}

export default function OrgLayout({ children, params }: LayoutProps) {
  return (
    <Suspense fallback={<OrgLayoutFallback />}>
      <OrgLayoutInner params={params}>{children}</OrgLayoutInner>
    </Suspense>
  );
}
