import connectDB from "@/lib/db";
import Organization from "@/models/organization/Organization";
import Board from "@/models/board/Board";
import List from "@/models/board/List";
import CardModel from "@/models/card/Card";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import CreateBoardCard from "@/components/create-board-card";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function BoardsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  await connectDB();
  const org = await Organization.findOne({ slug: orgSlug });
  if (!org) notFound();

  await validateOrgAccess(org._id.toString(), "viewer");

  const boards = await Board.find({
    organizationId: org._id,
    archived: false,
  }).sort({ createdAt: -1 });

  const boardIds = boards.map((b) => b._id);
  const lists = await List.find({ boardId: { $in: boardIds }, archived: false }).select("_id boardId");
  const listIds = lists.map((l) => l._id);

  const cards = await CardModel.find({
    listId: { $in: listIds },
    archived: false,
  }).select("_id listId dueDate");

  const boardToListIds = new Map<string, Set<string>>();
  for (const l of lists) {
    const boardId = l.boardId.toString();
    if (!boardToListIds.has(boardId)) boardToListIds.set(boardId, new Set<string>());
    boardToListIds.get(boardId)!.add(l._id.toString());
  }

  const boardStats = boards.map((board) => {
    const bId = board._id.toString();
    const listIdSet = boardToListIds.get(bId) ?? new Set<string>();

    let cardCount = 0;
    let overdueCount = 0;
    const now = new Date();

    for (const card of cards) {
      if (!listIdSet.has(card.listId.toString())) continue;
      cardCount += 1;
      if (card.dueDate && new Date(card.dueDate) < now) overdueCount += 1;
    }

    return {
      boardId: bId,
      cards: cardCount,
      overdue: overdueCount,
      lists: listIdSet.size,
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
          <h2 className="text-lg font-semibold text-gray-900">All Boards</h2>
          <p className="text-xs text-gray-500">{boards.length} results</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {boards.map((board) => {
            const stats = boardStats.find((s) => s.boardId === board._id.toString());
            return (
              <Link key={board._id.toString()} href={"/" + orgSlug + "/boards/" + board._id.toString()}>
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

          <CreateBoardCard organizationId={org._id.toString()} />
        </div>
      </section>
    </div>
  );
}