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
import mongoose from "mongoose";

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

  // Single batch database queries
  const boards = await Board.find({ organizationId: org._id, archived: false });
  const boardIds = boards.map((b) => b._id);

  const lists = await List.find({ boardId: { $in: boardIds }, archived: false });
  const listIds = lists.map((l) => l._id);

  const rawCards = await CardModel.find({ listId: { $in: listIds }, archived: false });
  const rawActivities = await ActivityModel.find({ organizationId: org._id })
    .sort({ createdAt: -1 })

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

  // Resolve user names & emails for assignees
  const assigneeIds = Array.from(
    new Set(allCards.map((c) => c.assigneeId).filter(Boolean))
  ) as string[];

  const userMap = new Map<string, { name: string; email: string }>();
  const db = mongoose.connection.db;
  if (db && assigneeIds.length > 0) {
    const users = await db
      .collection("user")
      .find(
        { _id: { $in: assigneeIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      )
      .toArray();

    users.forEach((u) => {
      const info = { name: u.name || "User", email: u.email || "" };
      if (u.id) userMap.set(u.id, info);
      if (u._id) userMap.set(u._id.toString(), info);
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
        <WorkspaceActivityFeed activities={activities} />
      </div>
    </div>
  );
}
