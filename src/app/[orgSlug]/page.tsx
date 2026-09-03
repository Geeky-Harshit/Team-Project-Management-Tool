import { DashboardActivityLive } from "@/components/dashboard/dashboard-activity-live";
import { DashboardOverdueLive } from "@/components/dashboard/dashboard-overdue-live";
import { DashboardStatsLive } from "@/components/dashboard/dashboard-stats-live";
import { DashboardWorkloadLive } from "@/components/dashboard/dashboard-workload-live";
import { ActivityFallback } from "@/components/fallbacks/dashboard/activity-fallback";
import { OverdueFallback } from "@/components/fallbacks/dashboard/overdue-fallback";
import { StatsFallback } from "@/components/fallbacks/dashboard/stats-fallback";
import { WorkloadFallback } from "@/components/fallbacks/dashboard/workload-fallback";
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
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden font-sans">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{org.name} Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of activities, boards, and members
        </p>
      </div>

      <div className="shrink-0">
        <Suspense fallback={<StatsFallback />}>
          <DashboardStatsLive orgId={org.id} />
        </Suspense>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <Suspense fallback={<OverdueFallback />}>
              <DashboardOverdueLive orgId={org.id} />
            </Suspense>
          </div>
          <div className="min-h-0 flex-1">
            <Suspense fallback={<WorkloadFallback />}>
              <DashboardWorkloadLive orgId={org.id} />
            </Suspense>
          </div>
        </div>
        <div className="min-h-0">
          <Suspense fallback={<ActivityFallback />}>
            <DashboardActivityLive orgId={org.id} />
          </Suspense>
        </div>
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
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden font-sans">
          <div className="shrink-0">
            <div className="h-7 w-64 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="shrink-0">
            <StatsFallback />
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
            <div className="flex min-h-0 flex-col gap-4">
              <div className="min-h-0 flex-1">
                <OverdueFallback />
              </div>
              <div className="min-h-0 flex-1">
                <WorkloadFallback />
              </div>
            </div>
            <div className="min-h-0">
              <ActivityFallback />
            </div>
          </div>
        </div>
      }
    >
      <OrgDashboardPageInner params={params} />
    </Suspense>
  );
}
