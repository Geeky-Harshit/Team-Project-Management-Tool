import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { prisma } from "@/lib/prisma";

function orgCardWhere(orgId: string) {
  return {
    archived: false,
    list: {
      archived: false,
      board: { organizationId: orgId, archived: false },
    },
  };
}

export async function DashboardStatsLive({ orgId }: { orgId: string }) {
  const now = new Date();
  const where = orgCardWhere(orgId);

  const [boardsCount, tasksCount, overdueCount] = await Promise.all([
    prisma.board.count({
      where: { organizationId: orgId, archived: false },
    }),
    prisma.card.count({ where }),
    prisma.card.count({
      where: { ...where, dueDate: { lt: now } },
    }),
  ]);

  return (
    <DashboardStats
      boardsCount={boardsCount}
      tasksCount={tasksCount || 0}
      overdueCount={overdueCount || 0}
    />
  );
}
