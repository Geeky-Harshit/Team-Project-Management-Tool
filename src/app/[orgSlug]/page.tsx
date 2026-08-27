import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks";
import { WorkloadBreakdown } from "@/components/dashboard/workload-breakdown";
import { WorkspaceActivityFeed } from "@/components/dashboard/workspace-activity";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Activity } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {

  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();
  await validateOrgAccess(org.id, "viewer", org);

  // Fetch data in batch via Prisma
  // Fetch boards (with lists and cards) and activities concurrently
  const now = new Date();
  const orgCardWhere = {
    archived: false,
    list: {
      archived: false,
      board: { organizationId: org.id, archived: false },
    },
  };

  const [boardsCount, tasksCount, overdueCount, overdueCards, workloadGroups, rawActivities, users] =
    await Promise.all([
      prisma.board.count({
        where: { organizationId: org.id, archived: false },
      }),
      prisma.card.count({ where: orgCardWhere }),
      prisma.card.count({
        where: { ...orgCardWhere, dueDate: { lt: now } },
      }),
      prisma.card.findMany({
        where: { ...orgCardWhere, dueDate: { lt: now } },
        orderBy: { dueDate: "asc" },
        take: 50, // UI list, not the whole org
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
      }),
      prisma.card.groupBy({
        by: ["assigneeId"],
        where: orgCardWhere,
        _count: { _all: true },
      }),
      prisma.activity.findMany({
        where: { organizationId: org.id },
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          members: {
            some: {
              organizationId: org.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

  const overdue = overdueCards.map((card) => ({
    id: card.id,
    listId: card.listId,
    title: card.title,
    description: card.description ?? "",
    assigneeId: card.assigneeId,
    dueDate: card.dueDate?.toISOString() ?? null,
    position: card.position,
    archived: card.archived,
    createdBy: card.createdBy,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }));

  const userMap = new Map(users.map((u) => [u.id, u]));

  const workloadEntries = workloadGroups.map((group) => {
    if (!group.assigneeId) {
      return {
        assignee: "Unassigned",
        count: group._count._all,
      };
    }

    const user = userMap.get(group.assigneeId);

    return {
      assignee: user?.name ?? "Unknown Member",
      email: user?.email,
      count: group._count._all,
    };
  });

  const activities: Activity[] = rawActivities.map((activity) => ({
    id: activity.id,
    organizationId: activity.organizationId,
    boardId: activity.boardId,
    cardId: activity.cardId,
    actorId: activity.actorId,
    type: activity.type as Activity['type'],
    message: activity.message,
    createdAt: activity.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{org.name} Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of activities, boards, and members</p>
      </div>

      <DashboardStats
        boardsCount={boardsCount}
        tasksCount={tasksCount || 0}
        overdueCount={overdueCount || 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <OverdueTasksList tasks={overdue} />
          <WorkloadBreakdown entries={workloadEntries} />
        </div>
        <WorkspaceActivityFeed initialActivities={activities} orgId={org.id} />
      </div>
    </div>
  );
}
