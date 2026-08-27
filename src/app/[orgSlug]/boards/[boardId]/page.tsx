import BoardView from "@/components/board/board-view";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
import { getCachedBoard, getCachedOrgBySlug } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { Card as ICard, List as IList, MemberUser as IMember } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ orgSlug: string; boardId: string }>;
}

// 1. Dynamic Metadata Generation
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orgSlug, boardId } = await params;
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) return { title: "Board Not Found" };

  const board = await getCachedBoard(boardId, org.id);
  if (!board) return { title: "Board Not Found" };

  return {
    title: board.name,
    description: `Manage tasks on the ${board.name} board.`,
  };
}

// 2. Main Page Server Component
export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;

  // Step 1: Resolve organization (cached)
  const org = await getCachedOrgBySlug(orgSlug);
  if (!org) notFound();

  // Step 2: Validate access
  const { role } = await validateOrgAccess(org.id, "viewer", org);
  const canEdit = role === "owner" || role === "admin" || role === "member";
  const isAdmin = role === "owner" || role === "admin";

  // Step 3: Fetch Board (cached) and Org Members in PARALLEL
  const [board, orgMembers] = await Promise.all([
    getCachedBoard(boardId, org.id),
    prisma.member.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
  ]);

  if (!board) notFound();

  const members: IMember[] = orgMembers.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
  }));

  const lists: IList[] = board.lists.map((l) => ({
    id: l.id,
    boardId: l.boardId,
    name: l.name,
    position: l.position,
    archived: l.archived,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const cards: ICard[] = board.lists.flatMap((l) =>
    l.cards.map((c) => ({
      id: c.id,
      listId: c.listId,
      title: c.title,
      description: c.description || "",
      assigneeId: c.assigneeId,
      dueDate: c.dueDate ? c.dueDate.toISOString() : null,
      position: c.position,
      archived: c.archived,
      createdBy: c.createdBy,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  );

  const now = new Date();
  const overdueCount = cards.filter(
    (c) => c.dueDate && new Date(c.dueDate) < now && !c.archived
  ).length;

  return (
    <BoardView
      boardId={board.id}
      boardName={board.name}
      canEdit={canEdit}
      lists={lists}
      cards={cards}
      members={members}
      orgName={org.name}
      overdueCount={overdueCount}
      isAdmin={isAdmin}
    />
  );
}
