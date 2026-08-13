"use client";

import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrgProvider } from "@/context/org-context";
import OrganizationList from "@/components/dashboard/organization-list";
import OrganizationForm from "@/components/dashboard/organization-form";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading your space...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <OrgProvider userId={session.user.id}>
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
