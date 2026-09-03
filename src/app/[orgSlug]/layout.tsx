import { OrgLayoutFallback } from "@/components/fallbacks/layout/org-layout-fallback";
import Sidebar from "@/components/sidebar";
import { OrgProvider } from "@/context/org-context";
import { getSession } from "@/lib/auth/auth";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
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

  const membership = await prisma.member.findFirst({
    where: {
      organizationId: org.id,
      userId: session.user.id,
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <OrgProvider
      userId={session.user.id}
      initialCurrentOrg={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt.toISOString(),
      }}
    >
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden relative">
        <Sidebar orgName={org.name} orgSlug={orgSlug} />
        <main className="flex-1 overflow-y-auto p-4">
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
