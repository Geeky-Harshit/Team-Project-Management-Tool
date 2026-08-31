import { OverdueTasksList } from "@/components/dashboard/overdue-tasks";
import { prisma } from "@/lib/prisma";
import { toCard } from "@/lib/serialize";

export async function DashboardOverdueLive({ orgId }: { orgId: string }) {
  const now = new Date();
  const overdueCards = await prisma.card.findMany({
    where: {
      archived: false,
      dueDate: { lt: now },
      list: {
        archived: false,
        board: { organizationId: orgId, archived: false },
      },
    },
    orderBy: { dueDate: "asc" },
    take: 50,
    select: {
      id: true,
      listId: true,
      title: true,
      description: true,
      assigneeId: true,
      dueDate: true,
      position: true,
      archived: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return <OverdueTasksList tasks={overdueCards.map(toCard)} />;
}
