import { prisma } from "@/lib/prisma";
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

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  const { role } = await validateOrgAccess(org.id, "viewer");
  const canEdit = role === "owner" || role === "admin" || role === "member";
  const isAdmin = role === "owner" || role === "admin";

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      organizationId: org.id,
      archived: false,
    },
  });
  if (!board) notFound();

  const rawLists = await prisma.list.findMany({
    where: {
      boardId: board.id,
      archived: false,
    },
    orderBy: { position: "asc" },
  });

  const listIds = rawLists.map((l) => l.id);

  const rawCards = await prisma.card.findMany({
    where: {
      listId: { in: listIds },
      archived: false,
    },
    orderBy: { position: "asc" },
  });

  const lists: IList[] = rawLists.map((l) => ({
    id: l.id,
    boardId: l.boardId,
    name: l.name,
    position: l.position,
    archived: l.archived ?? false,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const cards: ICard[] = rawCards.map((c) => ({
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

  const overdueCount = cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date()).length;

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <BoardHeader boardId={boardId} initialName={board.name} canEdit={canEdit} isAdmin={isAdmin} />
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
        <KanbanBoard initialLists={lists} initialCards={cards} boardId={boardId} canEdit={canEdit} />
      </section>
    </div>
  );
}
