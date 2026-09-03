import RestoreBoardButton from "@/components/board/restore-board-button";
import { ArchivedBoardsFallback } from "@/components/fallbacks/boards/archived-boards-fallback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Archive, ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Archived Boards Not Found" };

  return {
    title: `${org.name} | Archived Boards`,
    description: `Manage and restore archived boards for ${org.name}.`,
  };
}

async function ArchivedBoardsList({
  orgId,
  orgSlug,
}: {
  orgId: string;
  orgSlug: string;
}) {
  const archivedBoards = await prisma.board.findMany({
    where: {
      organizationId: orgId,
      archived: true,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: { select: { lists: true } },
    },
  });

  const archivedListRows = await prisma.list.findMany({
    where: { board: { organizationId: orgId, archived: true } },
    select: {
      boardId: true,
      _count: { select: { cards: true } },
    },
  });

  const taskCountByBoard = new Map<string, number>();
  for (const list of archivedListRows) {
    taskCountByBoard.set(
      list.boardId,
      (taskCountByBoard.get(list.boardId) ?? 0) + list._count.cards,
    );
  }

  if (archivedBoards.length === 0) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Archive className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">No archived boards</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are currently no archived boards in this workspace.
        </p>
        <div className="mt-6">
          <Link href={`/${orgSlug}/boards`}>
            <Button className="bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90">
              Go to Boards
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {archivedBoards.map((board) => {
        const listCount = board._count.lists;
        const taskCount = taskCountByBoard.get(board.id) ?? 0;

        return (
          <Card
            key={board.id}
            className="flex flex-col justify-between border-gray-200 p-5 shadow-xs"
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
              <RestoreBoardButton boardId={board.id} orgId={orgId} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

async function ArchivedBoardsPageInner({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  try {
    await validateOrgAccess(org.id, "admin", org);
  } catch {
    redirect(`/${orgSlug}/boards`);
  }

  return (
    <div className="flex w-full flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1">
        <Link
          href={`/${orgSlug}/boards`}
          className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Active Boards
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Archive</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Archived Boards
        </h1>
        <p className="text-sm text-gray-500">
          Recover boards that have been archived in this organization.
        </p>
      </div>

      <Suspense fallback={<ArchivedBoardsFallback />}>
        <ArchivedBoardsList orgId={org.id} orgSlug={orgSlug} />
      </Suspense>
    </div>
  );
}

export default function ArchivedBoardsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col gap-6 font-sans">
          <div className="flex flex-col gap-1 animate-pulse">
            <div className="mb-1 h-3.5 w-36 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-orange-100" />
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-100" />
          </div>
          <ArchivedBoardsFallback />
        </div>
      }
    >
      <ArchivedBoardsPageInner params={params} />
    </Suspense>
  );
}
