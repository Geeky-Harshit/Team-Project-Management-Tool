import { ActivityFallback } from "@/components/fallbacks/dashboard/activity-fallback";
import { OverdueFallback } from "@/components/fallbacks/dashboard/overdue-fallback";
import { StatsFallback } from "@/components/fallbacks/dashboard/stats-fallback";
import { WorkloadFallback } from "@/components/fallbacks/dashboard/workload-fallback";

export default function OrgDashboardLoading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-hidden font-sans">
      <div className="flex shrink-0 flex-col gap-1">
        <div className="h-3 w-20 animate-pulse rounded bg-orange-100" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="shrink-0">
        <StatsFallback />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-2 md:grid-cols-2 md:grid-rows-1">
        <div className="flex min-h-0 flex-col gap-2">
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
  );
}
