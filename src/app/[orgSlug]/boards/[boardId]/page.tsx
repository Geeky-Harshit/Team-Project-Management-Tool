import connectDB from "@/lib/db";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import CardModel from "@/models/card/Card";
import Organization from "@/models/organization/Organization";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import { BoardHeader } from "@/components/board/board-header";
import { KanbanBoard } from "@/components/board/kanban-board";
import { List as IList, Card as ICard } from "@/types";

interface PageProps {
  params: Promise<{ orgSlug: string; boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) notFound();

  await validateOrgAccess(org._id.toString(), "viewer");

  const board = await Board.findOne({
    _id: boardId,
    organizationId: org._id,
    archived: false,
  });
  if (!board) notFound();

  const rawLists = await List.find({
    boardId: board._id,
    archived: false,
  }).sort({ position: 1 });

  const rawCards = await CardModel.find({
    listId: { $in: rawLists.map((l) => l._id) },
    archived: false,
  }).sort({ position: 1 });

  const lists: IList[] = rawLists.map((l) => ({
    id: l._id.toString(),
    boardId: l.boardId.toString(),
    name: l.name,
    position: l.position,
    archived: l.archived ?? false,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const cards: ICard[] = rawCards.map((c) => ({
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

  const overdueCount = cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date()).length;

  return (
    <div className="mx-auto flex h-full w-full max-w-375 flex-col gap-6 p-4 md:p-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <BoardHeader boardId={boardId} initialName={board.name} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Lists</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{lists.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Tasks</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{cards.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Overdue</p>
            <p className="mt-1 text-xl font-bold text-red-600">{overdueCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Organization</p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-900">{org.name}</p>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <KanbanBoard initialLists={lists} initialCards={cards} boardId={boardId} />
      </section>
    </div>
  );
}