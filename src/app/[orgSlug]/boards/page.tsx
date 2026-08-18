import { prisma } from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import CreateBoardCard from "@/components/create-board-card";
import { Archive } from "lucide-react";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function BoardsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  const { role } = await validateOrgAccess(org.id, "viewer");
  const canManage = role === "owner" || role === "admin";
  const canCreate = role === "owner" || role === "admin" || role === "member";

  const boards = await prisma.board.findMany({
    where: {
      organizationId: org.id,
      archived: false,
    },
    orderBy: { createdAt: "desc" },
    include: {
      lists: {
        where: { archived: false },
        select: {
          id: true,
          cards: {
            where: { archived: false },
            select: { id: true, dueDate: true },
          },
        },
      },
    },
  });

  const now = new Date();
  const boardStats = boards.map((board) => {
    let totalCards = 0;
    let overdueCount = 0;

    board.lists.forEach((list) => {
      totalCards += list.cards.length;
      overdueCount += list.cards.filter((c) => c.dueDate && new Date(c.dueDate) < now).length;
    });

    return {
      boardId: board.id,
      cards: totalCards,
      overdue: overdueCount,
      lists: board.lists.length,
    };
  });

  const totalBoards = boards.length;
  const totalCards = boardStats.reduce((acc, b) => acc + b.cards, 0);
  const totalOverdue = boardStats.reduce((acc, b) => acc + b.overdue, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Boards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage planning spaces for this organization
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

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Boards</h2>
            <p className="text-xs text-gray-500">{boards.length} results</p>
          </div>
          {canManage && (
            <Link
              href={`/${orgSlug}/boards/archived`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Archive className="h-3.5 w-3.5 text-gray-500" />
              Archived Boards
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {boards.map((board) => {
            const stats = boardStats.find((s) => s.boardId === board.id);
            return (
              <Link key={board.id} href={`/${orgSlug}/boards/${board.id}`}>
                <Card className="group h-44 cursor-pointer border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                        Board
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-gray-900">
                        {board.name}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="rounded-md bg-gray-100 px-2 py-1">Lists: {stats?.lists ?? 0}</span>
                        <span className="rounded-md bg-gray-100 px-2 py-1">Tasks: {stats?.cards ?? 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created {new Date(board.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {canCreate && <CreateBoardCard organizationId={org.id} />}
        </div>
      </section>
    </div>
  );
}
