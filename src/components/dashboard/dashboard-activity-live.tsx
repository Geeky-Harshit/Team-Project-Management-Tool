import { WorkspaceActivityFeed } from "@/components/dashboard/workspace-activity";
import { prisma } from "@/lib/prisma";
import { toActivity } from "@/lib/serialize";

export async function DashboardActivityLive({ orgId }: { orgId: string }) {
  const rawActivities = await prisma.activity.findMany({
    where: { organizationId: orgId },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  return (
    <WorkspaceActivityFeed
      initialActivities={rawActivities.map(toActivity)}
      orgId={orgId}
    />
  );
}
