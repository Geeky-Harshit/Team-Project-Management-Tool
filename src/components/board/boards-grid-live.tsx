import CreateBoardCard from "@/components/create-board-card";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function BoardsGridLive({
  orgId,
  orgSlug,
  canCreate,
}: {
  orgId: string;
  orgSlug: string;
  canCreate: boolean;
}) {
  const now = new Date();

  const boards = await prisma.board.findMany({
    where: {
      organizationId: orgId,
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
    board: { organizationId: orgId, archived: false },
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
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Active Boards</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">{totalBoards}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Tasks</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">{totalCards}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue Tasks</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-red-600">{totalOverdue}</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Boards</h2>
          <p className="text-xs text-gray-500">{boards.length} boards available</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canCreate && <CreateBoardCard organizationId={orgId} />}

          {boards.map((board) => {
            const stats = boardStats.find((s) => s.boardId === board.id);
            return (
              <Link
                key={board.id}
                href={`/${orgSlug}/boards/${board.id}`}
                className="group block"
              >
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
                    <span>
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                    {stats && stats.overdue > 0 && (
                      <span className="rounded-full border border-red-200/60 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
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
    </>
  );
}
