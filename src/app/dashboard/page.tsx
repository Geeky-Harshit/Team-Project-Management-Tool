import OrganizationForm from "@/components/dashboard/organization-form";
import OrganizationList from "@/components/dashboard/organization-list";
import { DashboardPageFallback } from "@/components/fallbacks/dashboard/dashboard-page-fallback";
import { OrgProvider } from "@/context/org-context";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Organization } from "@/types";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your organizations and workspaces",
};

async function DashboardPageInner({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null | undefined;
}) {
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const initialOrgs: Organization[] = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    logo: m.organization.logo,
    metadata: m.organization.metadata,
    createdAt: m.organization.createdAt.toISOString(),
  }));

  return (
    <OrgProvider userId={userId} initialOrgs={initialOrgs}>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <main className="container mx-auto max-w-5xl flex-1 p-6">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Welcome, {userName}
          </h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <OrganizationList />
            <OrganizationForm />
          </div>
        </main>
      </div>
    </OrgProvider>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={<DashboardPageFallback userName={session.user?.name} />}>
      <DashboardPageInner
        userId={session.user.id}
        userName={session.user?.name}
      />
    </Suspense>
  );
}
