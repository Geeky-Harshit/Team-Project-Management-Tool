import CreateBoardCard from "@/components/create-board-card";
import { Card } from "@/components/ui/card";
import { canEditCards, canManageOrg } from "@/lib/auth/permissions";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Archive } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Boards Not Found" };

  return {
    title: `${org.name} | Boards`,
    description: `Kanban boards and workflows for ${org.name}.`,
  };
}

export default async function BoardsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  // 1. Cached Org lookup
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  // 2. Access check with preloaded org
  const { role } = await validateOrgAccess(org.id, "viewer", org);
  const canManage = canManageOrg(role);
  const canCreate = canEditCards(role);

  const now = new Date();

  const boards = await prisma.board.findMany({
    where: {
      organizationId: org.id,
      archived: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: {
        select: {
          lists: { where: { archived: false } },
        },
      },
    },
  });

  const orgListWhere = {
    archived: false,
    board: { organizationId: org.id, archived: false },
  };

  const [listRows, overdueByList] = await Promise.all([
    prisma.list.findMany({
      where: orgListWhere,
      select: {
        id: true,
        boardId: true,
        _count: {
          select: { cards: { where: { archived: false } } },
        },
      },
    }),
    prisma.card.groupBy({
      by: ["listId"],
      where: {
        archived: false,
        dueDate: { lt: now },
        list: orgListWhere,
      },
      _count: { _all: true },
    }),
  ]);

  const overdueByListId = new Map(
    overdueByList.map((row) => [row.listId, row._count._all]),
  );

  const statsByBoardId = new Map<
    string,
    { cards: number; overdue: number; lists: number }
  >();

  for (const list of listRows) {
    const current = statsByBoardId.get(list.boardId) ?? {
      cards: 0,
      overdue: 0,
      lists: 0,
    };
    current.lists += 1;
    current.cards += list._count.cards;
    current.overdue += overdueByListId.get(list.id) ?? 0;
    statsByBoardId.set(list.boardId, current);
  }

  const boardStats = boards.map((board) => ({
    boardId: board.id,
    lists: board._count.lists,
    cards: statsByBoardId.get(board.id)?.cards ?? 0,
    overdue: statsByBoardId.get(board.id)?.overdue ?? 0,
  }));

  const totalBoards = boards.length;
  const totalCards = boardStats.reduce((acc, b) => acc + b.cards, 0);
  const totalOverdue = boardStats.reduce((acc, b) => acc + b.overdue, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8 font-sans">
      {/* Top Workspace Header with 3 Stats Cards */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Boards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage planning spaces and workflows for {org.name}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500">Active Boards</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalBoards}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500">Total Tasks</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalCards}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500">Overdue Tasks</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totalOverdue}</p>
          </div>
        </div>
      </section>

      {/* All Boards Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Boards</h2>
            <p className="text-xs text-gray-500">{boards.length} boards available</p>
          </div>

          {canManage && (
            <Link
              href={`/${orgSlug}/boards/archived`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50"
            >
              <Archive className="h-4 w-4" />
              Archived Boards
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canCreate && <CreateBoardCard organizationId={org.id} />}

          {boards.map((board) => {
            const stats = boardStats.find((s) => s.boardId === board.id);
            return (
              <Link key={board.id} href={`/${org.slug}/boards/${board.id}`} className="group block">
                <Card className="flex h-44 flex-col justify-between border-gray-200 p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition">
                      {board.name}
                    </h3>
                    <p className="mt-2 text-xs text-gray-500">
                      {stats?.lists || 0} lists &bull; {stats?.cards || 0} tasks
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <span>Updated {new Date(board.updatedAt).toLocaleDateString()}</span>
                    {stats && stats.overdue > 0 && (
                      <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[11px]">
                        {stats.overdue} overdue
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}