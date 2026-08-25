import { BoardView } from "@/components/board/board-view";
import { validateOrgAccess } from "@/lib/auth/server-permissions";
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
  const { boardId } = await params;
  const board = await prisma.board.findFirst({
    where: { id: boardId, archived: false },
    select: { name: true },
  });

  if (!board) return { title: "Board Not Found" };

  return {
    title: board.name,
    description: `Manage tasks on the ${board.name} board.`,
  };
}

// 2. Main Page Server Component
export default async function BoardPage({ params }: PageProps) {
  const { orgSlug, boardId } = await params;

  // Step 1: Resolve organization
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) notFound();

  // Step 2: Validate access using preloaded org (saves 1 DB round-trip)
  const { role } = await validateOrgAccess(org.id, "viewer", org);
  const canEdit = role === "owner" || role === "admin" || role === "member";
  const isAdmin = role === "owner" || role === "admin";

  // Step 3: Fetch Board (with Lists & Cards) and Org Members in PARALLEL
  const [board, orgMembers] = await Promise.all([
    prisma.board.findFirst({
      where: {
        id: boardId,
        organizationId: org.id,
        archived: false,
      },
      include: {
        lists: {
          where: { archived: false },
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    }),
    prisma.member.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    }),
  ]);

  if (!board) notFound();

  // Step 4: Map organization members for assignee filters and modals
  const allOrgMembers: IMember[] = orgMembers.map((m) => ({
    id: m.user.id,
    name: m.user.name || "Member",
    email: m.user.email,
    image: m.user.image,
  }));

  // Step 5: Serialize lists and cards across client boundary
  const rawLists = board.lists;
  const rawCards = rawLists.flatMap((l) => l.cards);

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

  const overdueCount = cards.filter(
    (c) => c.dueDate && new Date(c.dueDate) < new Date()
  ).length;

  return (
    <BoardView
      boardId={boardId}
      boardName={board.name}
      canEdit={canEdit}
      lists={lists}
      cards={cards}
      members={allOrgMembers}
      orgName={org.name}
      overdueCount={overdueCount}
      isAdmin={isAdmin}
    />
  );
}
