import RestoreBoardButton from "@/components/board/restore-board-button";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { prisma } from "@/lib/prisma";
import { Archive, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ArchivedBoardsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  try {
    await validateOrgAccess(org.id, "admin");
  } catch {
    redirect(`/${orgSlug}/boards`);
  }

  const archivedBoards = await prisma.board.findMany({
    where: {
      organizationId: org.id,
      archived: true,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      lists: {
        select: {
          id: true,
          cards: {
            select: { id: true },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${orgSlug}/boards`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Active Boards
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Archived Boards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Recover boards that have been archived in this organization. Only admins and owners can restore boards.
          </p>
        </div>
      </div>

      {archivedBoards.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Archive className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No archived boards</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are currently no archived boards in this workspace.
          </p>
          <div className="mt-6">
            <Link
              href={`/${orgSlug}/boards`}
              className="inline-flex rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Go to Boards
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivedBoards.map((board) => {
            const listCount = board.lists.length;
            const taskCount = board.lists.reduce((acc, l) => acc + l.cards.length, 0);

            return (
              <div
                key={board.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      Archived
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{board.name}</h3>
                  <div className="mt-2 flex gap-2 text-xs text-gray-500">
                    <span>{listCount} lists</span>
                    <span>•</span>
                    <span>{taskCount} tasks</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-gray-100 pt-4">
                  <RestoreBoardButton
                    boardId={board.id}
                    orgId={org.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
