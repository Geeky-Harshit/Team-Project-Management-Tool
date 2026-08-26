import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrgProvider } from "@/context/org-context";
import OrganizationList from "@/components/dashboard/organization-list";
import OrganizationForm from "@/components/dashboard/organization-form";
import type { Metadata } from "next";
import { Organization } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your organizations and workspaces",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const memberships = await prisma.member.findMany({
    where: { userId: session.user.id },
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
    <OrgProvider userId={session.user.id} initialOrgs={initialOrgs}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 container mx-auto p-6 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome, {session.user?.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <OrganizationList />
            <OrganizationForm />
          </div>
        </main>
      </div>
    </OrgProvider>
  );
}
