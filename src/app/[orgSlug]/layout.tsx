import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { OrgProvider } from "@/context/org-context";
import OrgNotFoundPage from "./not-found";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

function OrgLayoutFallback() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50 md:flex-row">
      <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:w-64 md:border-b-0 md:border-r">
        <div className="animate-pulse p-4">
          <div className="h-12 rounded-lg bg-gray-100" />
          <div className="mt-4 h-9 rounded-md bg-gray-100" />
          <div className="mt-2 h-9 rounded-md bg-gray-100" />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    </div>
  );
}

async function OrgLayoutInner({ children, params }: LayoutProps) {
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
