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

  // 3. Lightweight boards fetch with counts
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

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize tasks, workflows, and milestones for {org.name}
          </p>
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
        {canCreate && <CreateBoardCard organizationId={org.id} orgSlug={org.slug} />}

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
    </div>
  );
}
