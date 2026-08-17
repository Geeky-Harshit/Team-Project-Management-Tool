import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";
import OrganizationMember from "@/models/organization/OrganizationMember";
import { redirect, notFound } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { OrgProvider } from "@/context/org-context";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: LayoutProps) {
  const { orgSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) {
    notFound();
  }

  const membership = await OrganizationMember.findOne({
    organizationId: org._id,
    userId: session.user.id,
  });

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <OrgProvider
      userId={session.user.id}
      initialCurrentOrg={{
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      }}
    >
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
        <Sidebar orgName={org.name} orgSlug={orgSlug} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </OrgProvider>
  );
}
