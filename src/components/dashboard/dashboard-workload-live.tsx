import { WorkloadBreakdown } from "@/components/dashboard/workload-breakdown";
import { prisma } from "@/lib/prisma";

export async function DashboardWorkloadLive({ orgId }: { orgId: string }) {
  const orgCardWhere = {
    archived: false,
    list: {
      archived: false,
      board: { organizationId: orgId, archived: false },
    },
  };

  const [workloadGroups, users] = await Promise.all([
    prisma.card.groupBy({
      by: ["assigneeId"],
      where: orgCardWhere,
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: {
        members: {
          some: { organizationId: orgId },
        },
      },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));

  const entries = workloadGroups.map((group) => {
    if (!group.assigneeId) {
      return { assignee: "Unassigned", count: group._count._all };
    }

    const user = userMap.get(group.assigneeId);
    return {
      assignee: user?.name ?? "Unknown Member",
      email: user?.email,
      count: group._count._all,
    };
  });

  return <WorkloadBreakdown entries={entries} />;
}
