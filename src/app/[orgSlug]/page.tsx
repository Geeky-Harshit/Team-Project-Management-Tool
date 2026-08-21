import { prisma } from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks";
import { WorkloadBreakdown, WorkloadEntry } from "@/components/dashboard/workload-breakdown";
import { WorkspaceActivityFeed } from "@/components/dashboard/workspace-activity";
import { notFound } from "next/navigation";
import { Card, Activity, ActivityType } from "@/types";

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  await validateOrgAccess(org.id, "viewer");

  // Fetch data in batch via Prisma
  // Fetch boards (with lists and cards) and activities concurrently
  const [boards, rawActivities] = await Promise.all([
    prisma.board.findMany({
      where: { organizationId: org.id, archived: false },
      include: {
        lists: {
          where: { archived: false },
          include: {
            cards: {
              where: { archived: false },
            },
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: { organizationId: org.id },
      take: 30,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rawCards = boards.flatMap((b) => b.lists.flatMap((l) => l.cards));


  const allCards: Card[] = rawCards.map((c) => ({
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description || "",
    dueDate: c.dueDate ? c.dueDate.toISOString() : null,
    assigneeId: c.assigneeId || null,
    position: c.position,
    archived: c.archived ?? false,
    createdBy: c.createdBy,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const activities: Activity[] = rawActivities.map((a) => ({
    id: a.id,
    organizationId: a.organizationId,
    boardId: a.boardId || null,
    cardId: a.cardId || null,
    actorId: a.actorId,
    type: a.type as ActivityType,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
  }));

  const now = new Date();
  const overdue = allCards.filter((c) => c.dueDate && new Date(c.dueDate) < now);

  // Resolve user names & emails for assignees via Prisma
  const assigneeIds = Array.from(
    new Set(allCards.map((c) => c.assigneeId).filter(Boolean))
  ) as string[];

  const userMap = new Map<string, { name: string; email: string }>();
  if (assigneeIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true, name: true, email: true },
    });

    users.forEach((u) => {
      userMap.set(u.id, { name: u.name || "User", email: u.email });
    });
  }

  const workloadMap = new Map<string, { name: string; email?: string; count: number }>();
  allCards.forEach((card) => {
    if (!card.assigneeId) {
      const current = workloadMap.get("unassigned") || { name: "Unassigned", count: 0 };
      workloadMap.set("unassigned", { ...current, count: current.count + 1 });
    } else {
      const user = userMap.get(card.assigneeId);
      const key = card.assigneeId;
      const current = workloadMap.get(key) || {
        name: user?.name || "Unknown Member",
        email: user?.email,
        count: 0,
      };
      workloadMap.set(key, { ...current, count: current.count + 1 });
    }
  });

  const workloadEntries: WorkloadEntry[] = Array.from(workloadMap.values()).map((entry) => ({
    assignee: entry.name,
    email: entry.email,
    count: entry.count,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{org.name} Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of activities, boards, and members</p>
      </div>

      <DashboardStats
        boardsCount={boards.length}
        tasksCount={allCards.length}
        overdueCount={overdue.length}
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
