import { DashboardActivityLive } from "@/components/dashboard/dashboard-activity-live";
import { DashboardOverdueLive } from "@/components/dashboard/dashboard-overdue-live";
import { DashboardStatsLive } from "@/components/dashboard/dashboard-stats-live";
import { DashboardWorkloadLive } from "@/components/dashboard/dashboard-workload-live";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Organization Not Found" };

  return {
    title: `${org.name} | Overview`,
    description: `Overview and task statistics for ${org.name}.`,
  };
}

function WidgetFallback({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-gray-200 bg-gray-100 ${className}`}
    />
  );
}

async function OrgDashboardPageInner({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();
  await validateOrgAccess(org.id, "viewer", org);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{org.name} Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of activities, boards, and members
        </p>
      </div>

      <Suspense fallback={<WidgetFallback className="h-28" />}>
        <DashboardStatsLive orgId={org.id} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<WidgetFallback className="h-80" />}>
            <DashboardOverdueLive orgId={org.id} />
          </Suspense>
          <Suspense fallback={<WidgetFallback className="h-64" />}>
            <DashboardWorkloadLive orgId={org.id} />
          </Suspense>
        </div>
        <Suspense fallback={<WidgetFallback className="h-full min-h-80" />}>
          <DashboardActivityLive orgId={org.id} />
        </Suspense>
      </div>
    </div>
  );
}

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <OrgDashboardPageInner params={params} />
  );
}
