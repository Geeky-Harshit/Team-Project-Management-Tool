import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import CardModel from "@/models/card/Card";
import ActivityModel from "@/models/activity/Activity";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks";
import { WorkloadBreakdown, WorkloadEntry } from "@/components/dashboard/workload-breakdown";
import { WorkspaceActivityFeed } from "@/components/dashboard/workspace-activity";
import { notFound } from "next/navigation";
import { Card, Activity } from "@/types";

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) notFound();

  await validateOrgAccess(org._id.toString(), "viewer");

  // Single batch database query
  const boards = await Board.find({ organizationId: org._id, archived: false });
  const boardIds = boards.map((b) => b._id);

  const lists = await List.find({ boardId: { $in: boardIds }, archived: false });
  const listIds = lists.map((l) => l._id);

  const rawCards = await CardModel.find({ listId: { $in: listIds }, archived: false });
  const rawActivities = await ActivityModel.find({ organizationId: org._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const allCards: Card[] = rawCards.map((c) => ({
    id: c._id.toString(),
    listId: c.listId.toString(),
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
    id: a._id.toString(),
    organizationId: a.organizationId.toString(),
    boardId: a.boardId ? a.boardId.toString() : null,
    cardId: a.cardId ? a.cardId.toString() : null,
    actorId: a.actorId,
    type: a.type,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  const now = new Date();
  const overdue = allCards.filter((c) => c.dueDate && new Date(c.dueDate) < now);

  const workloadMap = new Map<string, number>();
  allCards.forEach((card) => {
    const key = card.assigneeId || "Unassigned";
    workloadMap.set(key, (workloadMap.get(key) || 0) + 1);
  });
  const workloadEntries: WorkloadEntry[] = Array.from(workloadMap.entries()).map(([assignee, count]) => ({
    assignee,
    count,
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
        <WorkspaceActivityFeed activities={activities} />
      </div>
    </div>
  );
}